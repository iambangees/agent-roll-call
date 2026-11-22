# Hackathon submission pack — Agent Roll Call

Prepared 2026-11-18. Everything below is ready to paste into the official
submission form.

## Submission channel — FOUND 2026-11-22

**Official project submission form (Binance survey, login required):**
https://www.binance.com/en/survey/fb26d2bd25e04329b1ba77c7b3811d23
- It is the "Submit Project Now" destination from the official announcement
  (the Binance Square version of the announcement carries the button; the
  support-page text extraction dropped it, which is why earlier checks
  missed it). The form itself references the announcement URL and the
  2026-12-09 08:00 UTC deadline. Abubakar checked the Binance App's Agentic
  Wallet tab on 2026-11-22 — nothing there; this web survey is the channel.
- The form's header states as "Project eligibility": product live + **at
  least 30 Agent ID addresses** interacted during the Submission Period
  (in the announcement that gate is written under the Innovation Award;
  the Pioneer/Interaction section states no minimum — submit either way).
- Like the community-promo survey, it is tied to his Binance account, so
  Abubakar submits it himself. Status: NOT YET SUBMITTED as of 2026-11-22.

## Submission channel — earlier status (2026-11-18, superseded)

- Re-read the full Binance announcement
  (https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf):
  step 3 says "Submit your project name, website, contract address(es), Agent ID
  usage description, and other required materials during the Submission Period.
  No registration needed." — but the page links NO project-submission form. The
  only survey it links is the X promotion campaign survey
  (app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c), which
  is for X post links only and was already used for the promo post.
- Web searches on 2026-11-18 found no project-submission form on DoraHacks,
  Devpost, bnbchain.org, Binance Square, or Binance Wallet's X posts.
- Most likely remaining routes: a form inside the Binance App (Wallet / Agent ID
  hackathon page) or a form Binance publishes later in the window. Re-check the
  announcement page and the in-app Agent ID page before the 9 Dec 2026 08:00 UTC
  deadline. Do NOT submit project details through any unofficial form or DM link.

- **Project name:** Agent Roll Call
- **Website:** https://iambangees.github.io/agent-roll-call/
- **Repository:** https://github.com/iambangees/agent-roll-call
- **Contract address (BNB Chain mainnet):** 0x0e5220E733625A4E6618c47A119B34273dD904b5
- **Contract verification:** Sourcify exact match (creation + runtime), forwarded to BscScan/Etherscan 2026-11-18
- **Reward receiving address:** 0x1D299177871e716dE80D58887A560bcb80260424 (Agentic Wallet, bangees.ai)
- **Demo video (field 12, ~65s, real live-site captures with real on-chain data):** https://raw.githubusercontent.com/iambangees/agent-roll-call/main/site/demo.mp4 (file also at `site/demo.mp4` in the repo; a Pages mirror at iambangees.github.io/agent-roll-call/demo.mp4 was still pending push on 2026-11-22 due to the flaky proxy)

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
