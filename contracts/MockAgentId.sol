// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Test-only stand-in for the SPACE ID Agent ID registry.
///         NOT deployed to mainnet; used for local tests only.
contract MockAgentId {
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _tokenIds;

    function giveAgentId(address to, uint256 tokenId) external {
        _balances[to] = 1;
        _tokenIds[to] = tokenId;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256) {
        require(index == 0 && _balances[owner] > 0, "No token");
        return _tokenIds[owner];
    }
}
