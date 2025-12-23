"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "../constant"; 
import { useRouter } from "next/navigation";

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

export default function CreateListingPage() {
  const { account, signAndSubmitTransaction } = useWallet();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isListing, setIsListing] = useState(false);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Please connect your wallet first!");
    
    setIsListing(true);
    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v2::list_item_with_name`,
          typeArguments: [], 
          functionArguments: [name, (parseFloat(price) * 100_000_000).toString()],
        }
      });
      
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert("Asset listed successfully!");
      router.push("/"); // Redirect home
    } catch (e: any) {
      console.error("Listing Error:", e);
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {/* FIX 1: Card Background 
         - Light: bg-white
         - Dark: dark:bg-gray-800 (Dark Gray instead of White)
      */}
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        
        <div className="text-center mb-8">
          {/* FIX 2: Text Colors */}
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sell Asset</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">List your item on the blockchain</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleCreateListing}>
          {/* FIX 3: Input Fields 
             - Background: dark:bg-gray-900 (Darker than the card)
             - Text: dark:text-white (Visible!)
             - Border: dark:border-gray-700
          */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="e.g. Gold Sword"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (APT)</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="e.g. 1.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isListing}
            className="w-full py-4 text-white bg-gray-900 dark:bg-blue-600 rounded-xl font-bold hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-lg disabled:opacity-50"
          >
            {isListing ? "Confirming..." : "List Now"}
          </button>
        </form>
      </div>
    </div>
  );
}