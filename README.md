# ⚡ Cedera Market

**A GenAI-native NFT marketplace with a fully circular economy on Aptos.**

## 💡 What is it?
Cedera Market isn't just a static gallery. It's a complete ecosystem where users can generate assets using AI, mint them to IPFS, and trade them on a live secondary market.

Unlike standard demos, this project implements a **full "Escrow" trading model**—meaning assets are atomically swapped for APT, and users can flip (resell) items they've bought to keep the economy moving.

## 🔥 Key Features

### 1. 🤖 GenAI & IPFS Minting
* **Dual-Mode Creation:** Users can generate art on the fly using **Pollinations AI** or upload their own custom files.
* **Decentralized Storage:** All assets are pinned to **IPFS via Pinata** before minting, ensuring true ownership and permanence.

### 2. 💸 Circular Economy (Buy, Sell, Flip)
* **Atomic Swaps:** Smart contract (`market_v6`) handles immediate asset-for-money transfers.
* **Resell Mechanics:** It’s not a one-way street. Once you buy an asset, it moves to your "My Assets" wallet. You can then **re-list it at a new price** to the global marketplace, enabling a true trading environment.

### 3. 🔍 Real-Time Command Center
We built a robust client-side filtering engine to handle marketplace discovery without needing an indexer.
* **Price Filter:** Set Min/Max APT ranges to find deals.
* **Seller Search:** Paste a specific wallet address to see a creator's entire portfolio.
* **Live Search:** Filter assets by name/metadata instantly as you type.
* **Sorting:** Toggle between "Price: Low to High" and "High to Low".

## 🛠️ Tech Stack
* **Blockchain:** Aptos (Move Language)
* **Contract:** Custom `market_v6` module (Escrow & Resell logic)
* **Frontend:** Next.js 14, TypeScript, Tailwind CSS
* **Storage:** Pinata (IPFS)
* **AI Engine:** Pollinations.ai API
* **Wallet:** Aptos Wallet Adapter (Petra supported)

## ⚙️ How it Works
1.  **Mint:** User types a prompt -> AI generates image -> Uploads to IPFS -> Minted on Aptos.
2.  **List:** The NFT is transferred from the user to the Marketplace Contract (Escrow).
3.  **Buy:** A buyer pays APT -> Contract sends APT to seller -> Contract transfers NFT to Buyer's `MyItems` resource.
4.  **Resell:** Buyer sets a new price -> Contract pulls NFT from `MyItems` -> Puts it back on the Marketplace Shelf.

## 🚀 Getting Started

### Prerequisites
* Node.js & npm
* Petra Wallet (Aptos Devnet)

### Installation
```bash
# 1. Clone the repo
git clone https://github.com/Utkarshpandey0001/CedraMarket.git

# 2. Install dependencies
cd frontend
npm install

# 3. Setup Environment
# Create a .env file in frontend folderand add your Pinata JWT and Module address 
echo "NEXT_PUBLIC_PINATA_JWT=your_pinata_key_here" > .env
echo "NEXT_PUBLIC_MODULE_ADDRESS = "0x2af00cec9331ad1402032cf0612b904ed51eb2d7c401e38011c7e6b08cffc8f8" 
# 4. Run the app
npm run dev