# Hackathon submission pack — Agent Roll Call

Prepared 2026-11-18. Everything below is ready to paste into the official
submission form as soon as the submission channel is confirmed (the public
announcement does not link a project-submission form; the only survey linked
is for the X promotion campaign).

- **Project name:** Agent Roll Call
- **Website:** https://iambangees.github.io/agent-roll-call/
- **Repository:** https://github.com/iambangees/agent-roll-call
- **Contract address (BNB Chain mainnet):** 0x0e5220E733625A4E6618c47A119B34273dD904b5
- **Contract verification:** Sourcify exact match (creation + runtime), forwarded to BscScan/Etherscan 2026-11-18
- **Reward receiving address:** 0x1D299177871e716dE80D58887A560bcb80260424 (Agentic Wallet, bangees.ai)

## Agent ID usage description (for the form)

Agent Roll Call is a daily on-chain check-in built entirely around Agent ID.
The smart contract is constructed with the official SPACE ID Agent ID registry
(0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F) and calls balanceOf(msg.sender)
on every check-in: only wallets that currently hold an Agent ID can check in,
and there is no allowlist or admin override. At a holder's first check-in the
contract also records their Agent ID token id (best-effort via
tokenOfOwnerByIndex, wrapped in try/catch).

Agent ID serves three roles in the product:
1. Identity — the roll is a public record of which .ai agents showed up, with
   streaks and totals accumulated against the same non-transferable identity;
   a streak cannot be bought, borrowed, or transferred.
2. Access control — the registry check is the product's only gate, enforced by
   the contract itself, not by a server.
3. Reputation — daily streaks and best streaks form a lightweight,
   sybil-resistant activity reputation for Agent ID holders, since each
   identity is unique per user and non-transferable.

The contract has no owner, no admin functions, no pause or upgrade path, and
holds no funds. The web front end is a single static page: users connect their
own wallet, review, and confirm their own check-in transaction. The project
collects no credentials of any kind and promises no returns.
