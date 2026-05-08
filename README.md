# 🦍 Gorilla Counter

The onchain gorilla chest-beating competition on **Base mainnet**.

Beat your chest, climb the leaderboard, become the **Alpha Gorilla**.

**Live:** [gorilla-counter.vercel.app](https://gorilla-counter.vercel.app/) · [gorillachimps.github.io/gorilla-counter](https://gorillachimps.github.io/gorilla-counter/)

**Contract:** [`0x90fc6B668293Bc2d9Ce78eC6E1c2d0d2c00EE668`](https://basescan.org/address/0x90fc6B668293Bc2d9Ce78eC6E1c2d0d2c00EE668) (Base Mainnet)

![Gorilla Counter](og-image.png)

## What it is

A single-page dapp where every chest beat is an onchain transaction on Base. The contract tracks per-wallet beat counts, a global beat counter, and the current Alpha Gorilla (the wallet with the most beats). Users can name their gorilla, climb the leaderboard, and share their beats on X and Farcaster.

## Features

- **Onchain everything** — every beat is a real transaction on Base mainnet
- **Live leaderboard** with Basenames resolution
- **Streak tracking** (local) and milestone badges (1, 10, 50, 100, 500, 1000 beats)
- **Farcaster Mini App** — runs natively in Warpcast with auto-connect
- **base.dev registered** app
- **ERC-8021 attribution** wired into every transaction (builder code `bc_5jexnr1x`)
- **Share to X / Warpcast** with one click
- **No build step** — single `index.html`, deploys to anything

## Stack

- `index.html` — vanilla HTML/CSS/JS, no framework, no build
- `GorillaCounter.sol` — Solidity 0.8.31, deployed on Base mainnet
- `@farcaster/miniapp-sdk` via ESM for Mini App embedding
- Direct `eth_call` / `eth_sendTransaction` to a public Base RPC — no library dependency
- Custom keccak256 implementation for Basenames reverse resolution

## Deploy

The repo auto-deploys to Vercel on push to `main`. A GitHub Pages workflow mirrors to `gorillachimps.github.io/gorilla-counter`.

## Contract

```solidity
function beatChest() external;
function setGorillaName(string calldata name) external;
function getGorillaStats(address gorilla) external view returns (uint256 beats, string memory name, bool isAlpha);
```

Compiled with Solidity `0.8.31+commit.fd3a2265`, optimizer off, EVM `osaka`. Verified on [Sourcify](https://sourcify.dev/#/lookup/0x90fc6B668293Bc2d9Ce78eC6E1c2d0d2c00EE668).

## License

MIT — see [LICENSE](LICENSE).
