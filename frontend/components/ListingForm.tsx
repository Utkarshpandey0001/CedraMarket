"use client";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "../app/constant";

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

// Define the interface for the props passed from page.tsx
interface ListingFormProps {
  onRefresh: () => void;
}

export const ListingForm = ({ onRefresh }: ListingFormProps) => {
  const { signAndSubmitTransaction } = useWallet();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isLising, setIsListing] = useState(false);

  const handleCreateListing = async () => {
    if (!name || !price) return alert("Please fill all fields");
    setIsListing(true);
    try {
      const response = await signAndSubmitTransaction({
        data: {
          // CRITICAL: Must be 'market_v2' to match your contract
          function: `${MODULE_ADDRESS}::market_v2::list_item_with_name`,
          typeArguments: [], 
          // Arguments: Name (String) and Price (u64)
          functionArguments: [name, (parseFloat(price) * 100_000_000).toString()],
        }
      });
      
      // WAIT for the blockchain to finish
      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      // CALL the parent function to refresh the market grid
      onRefresh(); 
      alert("Asset listed successfully!");
      setName("");
      setPrice("");
    } catch (e: any) {
      console.error("Listing Error:", e);
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border shadow-xl shadow-blue-900/5 sticky top-28">
      <h2 className="text-xl font-extrabold mb-6 tracking-tight">Sell Asset</h2>
      <div className="space-y-4">
        <input 
          value={name}
          placeholder="Asset Name" 
          className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition" 
          onChange={(e) => setName(e.target.value)} 
        />
        <input 
          value={price}
          placeholder="Price in APT" 
          type="number" 
          className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition" 
          onChange={(e) => setPrice(e.target.value)} 
        />
        <button 
          disabled={isLising}
          onClick={handleCreateListing} 
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition duration-300 disabled:bg-slate-400"
        >
          {isLising ? "LISTING..." : "LIST NOW"}
        </button>
      </div>
    </div>
  );
};