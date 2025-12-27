# 🤖 Cedra Market: The Frictionless GenAI Marketplace

> **Mint, Trade, and Track AI Artifacts with Zero Wallet Friction.**
> Built for the **Cedra Builder Forge** Hackathon.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://cedra-market.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/💻_Source_Code-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/Utkarshpandey0001/CedraMarket.git)

![Project Banner](https://via.placeholder.com/1200x400?text=Cedra+Builder+Forge+Project)

## 🚀 The Problem
Traditional Web3 marketplaces create massive friction for new users:
1.  **Onboarding Hell:** Users must install extensions, manage keys, and fund wallets just to *try* an app.
2.  **Static Content:** Most NFTs are just uploaded files, not generated interactively on-chain.
3.  **Broken UX:** Every action requires a popup confirmation, breaking immersion.

## ⚡ Our Solution: "Burner Mode"
Cedra Market introduces a **Wallet-Optional Architecture** powered by the Cedra TS SDK.
* **Instant Onboarding:** The app generates temporary "Burner Wallets" in the background for every user action.
* **Auto-Funding:** New wallets are automatically funded via the Testnet Faucet.
* **Result:** Users can Mint, Buy, and Sell instantly—**no popup approvals required.**

---

## 🔥 Key Features

### 1. 🎨 AI-Native Minting
* Integrated **Generative AI** engine directly in the minting flow.
* Type a prompt → Generate Art → Mint to Chain in one click.
* Metadata pinned to **IPFS** via Pinata for decentralized permanence.

### 2. 👻 Ghost Buyer & "Key Ring" System
* **One-Click Buy:** Clicking "Buy" creates a fresh wallet, funds it, and executes the purchase instantly.
* **Key Ring Persistence:** The app securely saves the private keys of these "Ghost Wallets" to local storage.
* **Resell Capability:** Because keys are saved, users can easily resell items they bought, proving full ownership transfer without managing a seed phrase.

### 3. 📊 Live Ledger & Traceability
* **Dual-View Ledger:** Tracks both the **Seller** (Beneficiary) and the **Escrow Holder** (Marketplace Module).
* **Real-Time Status:** Merges live blockchain data with local history to show accurate "Listed" vs "Sold" statuses.
* **Smart History:** The "My Assets" sidebar automatically remembers every wallet address used in the session.

---

## 🛠 Tech Stack

* **Blockchain:** Cedra Network (Testnet)
* **Smart Contract:** Move Language (Cedra Framework)
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
* **Storage:** IPFS (Pinata)
* **SDK:** `@cedra-labs/ts-sdk` (Native integration)

---

## ⚙️ Setup & Installation

### 1. Clone the Repo
```bash
git clone [https://github.com/Utkarshpandey0001/CedraMarket.git](https://github.com/Utkarshpandey0001/CedraMarket.git)
cd CedraMarket
npm install
npm run dev