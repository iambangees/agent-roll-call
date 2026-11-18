// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Minimal interface for the SPACE ID Agent ID registry (ERC-721).
interface IAgentIdRegistry {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

/// @title Agent Roll Call
/// @notice A daily on-chain check-in for Binance Agentic Wallet Agent ID holders.
///         Only wallets holding an Agent ID (name.ai) can check in. Each holder can
///         check in once per UTC day, build a streak, and leave a short "shout"
///         shown next to their check-in. There is no owner and no admin function:
///         nobody can move funds (the contract holds none), edit records, or pause it.
contract AgentRollCall {
    /// @notice The official Agent ID registry on BNB Chain (SPACE ID Agent ID, ERC-721).
    IAgentIdRegistry public immutable registry;

    struct Stats {
        uint256 totalCheckIns;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 lastDay; // UTC day number of the last check-in (timestamp / 86400)
        uint256 tokenId; // Agent ID token id, recorded best-effort at first check-in
        string shout; // latest shout (may be empty)
    }

    mapping(address => Stats) private _stats;
    mapping(address => bool) private _counted;
    address[] private _agents; // unique agents, in order of first check-in

    uint256 public totalCheckIns;

    event CheckedIn(
        address indexed agent,
        uint256 indexed day,
        uint256 streak,
        uint256 totalCheckIns,
        string shout
    );

    constructor(address registry_) {
        require(registry_ != address(0), "Registry required");
        registry = IAgentIdRegistry(registry_);
    }

    /// @notice True if `user` currently holds an Agent ID.
    function hasAgentId(address user) public view returns (bool) {
        return registry.balanceOf(user) > 0;
    }

    /// @notice Check in for today (UTC). Optionally leave or update your shout (max 140 chars).
    function checkIn(string calldata shout) external {
        require(registry.balanceOf(msg.sender) > 0, "Agent ID required");
        require(bytes(shout).length <= 140, "Shout too long");

        uint256 day = block.timestamp / 86400;
        Stats storage s = _stats[msg.sender];
        require(s.lastDay != day || s.totalCheckIns == 0, "Already checked in today");

        if (s.totalCheckIns > 0 && s.lastDay == day - 1) {
            s.currentStreak += 1;
        } else {
            s.currentStreak = 1;
        }
        if (s.currentStreak > s.bestStreak) {
            s.bestStreak = s.currentStreak;
        }
        s.lastDay = day;
        s.totalCheckIns += 1;
        if (bytes(shout).length > 0) {
            s.shout = shout;
        }
        if (s.tokenId == 0) {
            try registry.tokenOfOwnerByIndex(msg.sender, 0) returns (uint256 tid) {
                s.tokenId = tid;
            } catch {}
        }
        if (!_counted[msg.sender]) {
            _counted[msg.sender] = true;
            _agents.push(msg.sender);
        }
        totalCheckIns += 1;

        emit CheckedIn(msg.sender, day, s.currentStreak, s.totalCheckIns, shout);
    }

    /// @notice Full stats for one agent.
    function statsOf(address user)
        external
        view
        returns (
            uint256 totalCheckIns_,
            uint256 currentStreak,
            uint256 bestStreak,
            uint256 lastDay,
            uint256 tokenId,
            string memory shout,
            bool checkedInToday
        )
    {
        Stats storage s = _stats[user];
        uint256 day = block.timestamp / 86400;
        // A streak only counts while it is alive (last check-in today or yesterday).
        uint256 liveStreak = (s.lastDay == day || s.lastDay == day - 1) ? s.currentStreak : 0;
        return (
            s.totalCheckIns,
            liveStreak,
            s.bestStreak,
            s.lastDay,
            s.tokenId,
            s.shout,
            s.lastDay == day && s.totalCheckIns > 0
        );
    }

    /// @notice Number of unique Agent ID holders who have ever checked in.
    function uniqueAgentCount() external view returns (uint256) {
        return _agents.length;
    }

    /// @notice Agent address by index (order of first check-in).
    function agentAt(uint256 index) external view returns (address) {
        return _agents[index];
    }
}
