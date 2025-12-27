"use client";

import { useState, useEffect } from "react";
import { cedra, MODULE_ADDRESS } from "../constant";
import { Account, Ed25519PrivateKey } from "@cedra-labs/ts-sdk";
import { motion, AnimatePresence } from "framer-motion";

export default function MyAssetsPage() {
  const [inputAddress, setInputAddress] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentWallets, setRecentWallets] = useState<string[]>([]);
  
  // Resell State
  const [resellingItem, setResellingItem] = useState<any | null>(null);
  const [resellPrice, setResellPrice] = useState("");
  const [isReselling, setIsReselling] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cedra_recent_wallets");
    if (saved) setRecentWallets(JSON.parse(saved));
  }, []);

  const fetchMyItems = async (addrToFetch: string) => {
    setLoading(true);
    setItems([]);
    let cleanAddr = addrToFetch.trim();
    if (!cleanAddr.startsWith("0x")) cleanAddr = "0x" + cleanAddr;
    setInputAddress(cleanAddr);

    try {
      const resource = await cedra.getAccountResource({
        accountAddress: cleanAddr,
        resourceType: `${MODULE_ADDRESS}::market_v6::MyItems`,
      });
      // @ts-ignore
      setItems(resource.items);
    } catch (error) {
      console.log("No assets found");
    } finally {
      setLoading(false);
    }
  };

  const handleResellClick = (item: any) => {
    // Check if we have the key to sign!
    const key = localStorage.getItem(`cedra_key_${inputAddress}`);
    if (!key) {
      alert("Cannot resell: You don't own the private key for this wallet (it wasn't saved in this session).");
      return;
    }
    setResellingItem(item);
  };

  const confirmResell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellingItem || !resellPrice) return;
    setIsReselling(true);

    try {
      // 1. Recover Account from Local Storage
      const privateKeyHex = localStorage.getItem(`cedra_key_${inputAddress}`);
      if (!privateKeyHex) throw new Error("Key lost!");
      
      const privateKey = new Ed25519PrivateKey(privateKeyHex);
      const sellerAccount = Account.fromPrivateKey({ privateKey });

      // 2. Build Resell Transaction
      const transaction = await cedra.transaction.build.simple({
        sender: sellerAccount.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::market_v6::resell_item`,
          functionArguments: [
            resellingItem.id, 
            (parseFloat(resellPrice) * 100_000_000).toString()
          ],
        },
      });

      // 3. Sign & Submit
      const response = await cedra.signAndSubmitTransaction({
        signer: sellerAccount,
        transaction,
      });

      await cedra.waitForTransaction({ transactionHash: response.hash });

      // 4. Update Ledger Status back to LISTED
      const history = JSON.parse(localStorage.getItem("cedra_global_ledger") || "[]");
      const updatedHistory = history.map((hItem: any) => {
        if (hItem.asset.name === resellingItem.name) {
          return { 
            ...hItem, 
            status: "Listed", 
            price: (parseFloat(resellPrice) * 100_000_000).toString(),
            owner: hItem.seller // Ownership technically moves to Marketplace, but original seller gets money
          };
        }
        return hItem;
      });
      localStorage.setItem("cedra_global_ledger", JSON.stringify(updatedHistory));

      alert("Success! Item is back on the market.");
      setResellingItem(null);
      setResellPrice("");
      fetchMyItems(inputAddress); // Refresh list (item should disappear from 'My Items')

    } catch (e: any) {
      console.error(e);
      alert("Resell Error: " + e.message);
    } finally {
      setIsReselling(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 relative">
      
      {/* Sidebar */}
      <div className="md:w-1/3 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">🕒 Recent Activity</h3>
        <div className="space-y-2">
          {recentWallets.map((addr, i) => (
            <button key={i} onClick={() => fetchMyItems(addr)} className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-blue-400 font-mono text-xs font-bold">Wallet #{recentWallets.length - i}</span>
                <span className="text-slate-400 font-mono text-xs truncate w-32">{addr.slice(0, 10)}...</span>
              </div>
              <span className="text-slate-500 group-hover:text-white">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="md:w-2/3">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 mb-8">
          <h1 className="text-3xl font-black text-white mb-4">My Collection</h1>
          <form onSubmit={(e) => { e.preventDefault(); fetchMyItems(inputAddress); }} className="flex gap-2">
            <input type="text" placeholder="Wallet Address..." value={inputAddress} onChange={(e) => setInputAddress(e.target.value)} className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl font-mono outline-none" />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">{loading ? "..." : "Check"}</button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={index} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <img src={item.content_uri} className="w-full aspect-square object-cover rounded-xl mb-3 bg-black" />
                <h3 className="font-bold text-white text-lg">{item.name}</h3>
                <button 
                  onClick={() => handleResellClick(item)}
                  className="mt-4 w-full bg-white text-black font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                >
                  Resell Asset
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && !loading && <div className="text-center text-slate-500 py-10 col-span-2">No assets found in this wallet.</div>}
        </div>
      </div>

      {/* 🟢 RESELL MODAL */}
      <AnimatePresence>
        {resellingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2">Resell "{resellingItem.name}"</h2>
              <p className="text-slate-400 mb-6">Enter a new price to list this asset back on the market.</p>
              
              <form onSubmit={confirmResell} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">New Price (CED)</label>
                  <input 
                    type="number" step="0.01" required autoFocus
                    className="w-full bg-slate-800 text-white text-2xl font-bold px-4 py-3 rounded-xl border border-slate-700 focus:border-blue-500 outline-none mt-1"
                    placeholder="0.00"
                    value={resellPrice}
                    onChange={(e) => setResellPrice(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setResellingItem(null)} className="flex-1 py-3 font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isReselling} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
                    {isReselling ? "Signing..." : "Confirm Listing"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}