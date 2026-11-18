# Agent ID Hackathon — Project Scope

Prepared 2026-11-18 for Abubakar (Agent ID: bangees.ai).
Event: Binance Wallet × BNB Chain "Agent ID Hackathon" — 60,000 USDC total rewards.
Announcement: https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf

## Deadlines (UTC)

- Submission period: 18 Nov 2026 08:00 → 9 Dec 2026 08:00 (09:00 WAT start/end)
- Internal review: 9–17 Dec · Public review: 17–20 Dec
- Rewards: within 14 business days after the public announcement period, to the address given at submission

## What an entry must be (from the announcement)

- A live dApp deployed on BNB Chain, contracts source-verified and open-source on BscScan
- Actively uses Agent ID (registry contract 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F, SPACE ID, ERC-721, non-transferable)
- One project per team; only activity during the submission period counts
- Innovation Award eligibility: live product + at least 30 Agent ID addresses interacting during the period
- Safety red lines: no QR-code/pairing-code wallet login inside the product, users must confirm any asset operation themselves, no promised returns ("passive income" wording banned), no collecting seed phrases/private keys/pairing codes, contract owner permissions documented, no Binance/BNB impersonation in the name

## Concept options

**A. Agent Roll Call (recommended)** — a daily on-chain check-in that only Agent ID holders can make. Streaks, total check-ins, and a public leaderboard. One small contract; every check-in is a transaction, which feeds both award metrics (unique Agent ID addresses + transaction count).

**B. Agent Wall** — an on-chain guestbook: Agent ID holders post a short line under their .ai name. Identity showcase, fewer repeat transactions than A.

**C. Agent Tips** — tip any .ai name in BNB. A payments use case, but name→address resolution adds build complexity and it handles user funds (more risk, more review surface).

**Recommendation: A + B in one contract** — daily check-in with an optional one-line shout. Still one small contract (~150 lines of Solidity) and one static web page.

## How the Agent ID gate works

The contract calls `balanceOf(msg.sender)` on the Agent ID registry; a result above 0 means the caller holds an Agent ID and may check in. Non-holders are rejected by the contract itself. The web page reads the visitor's Agent ID name for display (exact registry lookup to be confirmed against the live ABI at build time; fallback is the short wallet address).

Users interact from inside the Binance App's wallet browser (injected provider). No QR pairing login anywhere in the product, per the red lines.

## Build and deployment route

- Tooling on this machine: Node.js 24 + npm are ready; Solidity compiler installs via npm (solc-js). No Foundry/Hardhat preinstalled — not needed for a contract this size.
- Test first on BSC testnet (free faucet BNB) — full rehearsal: deploy, verify, check in from bangees.ai.
- The Agentic Wallet's `contract-call` requires a target contract address, so it cannot deploy a brand-new contract directly. Standard route instead: a fresh one-time deployer wallet created locally (its key never leaves this machine and it holds nothing afterwards), funded with a small amount of BNB. After deployment, contract ownership can be transferred to the Agentic Wallet address (0x1D299177871e716dE80D58887A560bcb80260424) or renounced.
- Source verification on BscScan + public GitHub repo: free, done at build time.

## Costs (checked 2026-11-18)

- BSC gas price today: 0.05 gwei (live RPC check)
- Estimated deployment: ~600k–900k gas ≈ 0.00003–0.00005 BNB — a few US cents
- Suggested deployer funding: 0.002 BNB (about $1.50–$2) — ~50× headroom for deploy + tests; the unused remainder can be sent back
- Each user check-in: ~40k gas ≈ a fraction of a cent, paid by the user checking in
- Hosting: free static hosting (e.g. GitHub Pages); custom domain optional and skipped for now
- Abubakar's own part: reconnect the Agentic Wallet when needed and make his own check-in from bangees.ai (gas: cents from the existing ~0.00026 BNB)

## The real challenge: 30+ genuine Agent ID interactions

Code is the easy half. The Innovation threshold (30 unique Agent ID addresses) and the Growth ranking (unique addresses + transaction volume/count) both depend on reaching holders. Planned channels, all used by existing Agent ID projects:

1. The daily "Binance Agent ID Morning Briefing" newsletter (Substack) that lists new Agent ID projects — pitch the project for inclusion
2. Boltbook Alphapedia — the agent-read directory where Agent ID projects get catalogued
3. Agent ID Telegram communities (including the ~2,800-member JAGENT group) — project announcements are normal there
4. Ecosystem X accounts that round up new Agent ID projects

Warning: Binance disqualifies entries using mass-registered fake accounts or manipulated volume. Interactions must be genuine holders — no bought or farmed check-ins.

Optional extra: the Community Promotion pool (20 winners × 100 USDC) requires an original X post about a participating project with #BinanceWalletHackathon and #AgenticWallet, submitted via Binance's campaign survey. Separate decision — Abubakar has previously declined public promo posting.

## Timeline

- 18–19 Nov: write contract + page, testnet rehearsal
- 20 Nov: mainnet deploy, BscScan verification, repo public
- 21 Nov: submit the entry (project name, website, contract addresses, Agent ID usage description)
- 21 Nov – 9 Dec: outreach + daily check-in momentum; monitor unique Agent ID count on BscScan

One open item: the announcement text does not expose a direct submission-form URL (the X promo uses a Binance campaign survey). Confirm the exact project-submission channel in the first build days — well before the deadline.

## Honest odds

Many teams will enter, some with existing audiences. A prize is a long shot; the realistic targets are a valid live entry, the 30-interaction Innovation threshold, and a shot at the 6th–10th place band (800 USDC per award category) if outreach lands. Effort is mostly Muse's; Abubakar's cash exposure is ~$2 and a few minutes of wallet approvals.

## Decisions needed before building

1. Approve the concept (A+B "Agent Roll Call") or pick another
2. Approve the project name (working title: **Agent Roll Call** — no Binance/BNB words, per the rules)
3. When build day comes: send ~0.002 BNB to the deployer address and reconnect the Agentic Wallet for the test check-in
