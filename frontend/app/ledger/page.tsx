"use client";

import { useState, useEffect } from "react";
import { cedra, MODULE_ADDRESS } from "../constant";
import { motion } from "framer-motion";

// Helper for address abbreviation
const ShortAddr = ({ addr }: { addr: string }) => (
  <span className="font-mono text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
    {addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Unknown"}
  </span>
);

export default function LedgerPage() {
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLedger = async () => {
      try {
        // 1. Fetch Active Listings from Chain (Source of Truth for 'Listed')
        let activeListings: any[] = [];
        try {
          const resource = await cedra.getAccountResource({
            accountAddress: MODULE_ADDRESS,
            resourceType: `${MODULE_ADDRESS}::market_v6::Listings`,
          });
          // @ts-ignore
          activeListings = resource.items || [];
        } catch (e) {
          console.log("No active chain listings found");
        }

        // 2. Fetch History from Local Storage (Source for 'Sold' & Metadata)
        const localHistory = JSON.parse(localStorage.getItem("cedra_global_ledger") || "[]");

        // 3. MERGE LOGIC
        // We prefer Chain Data for active items. We use Local Data for sold items.
        
        const mergedLedger = localHistory.map((localItem: any) => {
          // Check if this local item is still active on chain
          const isOnChain = activeListings.find(
            (chainItem) => chainItem.asset.name === localItem.asset.name
          );

          if (isOnChain) {
            // It is still listed! Sync details from chain to be safe
            return {
              ...localItem,
              id: isOnChain.id,
              price: isOnChain.price,
              owner: isOnChain.seller, // If listed, owner is the seller
              status: "Listed"
            };
          } else {
            // Not on chain? It must be sold (or user created it locally)
            return {
              ...localItem,
              status: "Sold" // Keep the owner we set during 'handleBuy'
            };
          }
        });

        // 4. Add any chain items that might be missing from local history (Edge case)
        activeListings.forEach(chainItem => {
          const exists = mergedLedger.find((m: any) => m.asset.name === chainItem.asset.name);
          if (!exists) {
            mergedLedger.unshift({
              id: chainItem.id,
              asset: chainItem.asset,
              price: chainItem.price,
              owner: chainItem.seller,
              status: "Listed",
              timestamp: new Date().toISOString()
            });
          }
        });

        setLedgerData(mergedLedger);

      } catch (e) {
        console.error("Sync Error:", e);
      } finally {
        setLoading(false);
      }
    };

    syncLedger();
    // Poll every 5 seconds to keep it "Live" during demo
    const interval = setInterval(syncLedger, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto">
      
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black text-white mb-4">Master Ledger</h1>
        <p className="text-slate-400">
          Permanent record of all <span className="text-green-400 font-bold">Listed</span> and <span className="text-slate-500 font-bold">Sold</span> assets on Cedra Network.
        </p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                <th className="p-5 font-semibold">Asset</th>
                <th className="p-5 font-semibold">Current Owner Address</th>
                <th className="p-5 font-semibold text-right">Price</th>
                <th className="p-5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && ledgerData.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500">Syncing Blockchain...</td></tr>
              ) : ledgerData.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500">Ledger is empty. Mint something!</td></tr>
              ) : (
                ledgerData.map((item, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="group hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Asset */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img src={item.asset.content_uri} className="w-12 h-12 rounded-lg object-cover bg-black border border-slate-700" />
                        <span className="font-bold text-white">{item.asset.name}</span>
                      </div>
                    </td>

                    {/* Current Owner */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase mb-1">
                          {item.status === "Listed" ? "Seller (Creator)" : "Buyer (Holder)"}
                        </span>
                        <div className="flex items-center gap-2">
                           <ShortAddr addr={item.owner || item.seller} />
                           {/* Simple Copy Trigger */}
                           <button 
                             onClick={() => navigator.clipboard.writeText(item.owner || item.seller)}
                             className="text-slate-600 hover:text-blue-400 transition-colors"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                               <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                               <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.379 6H4.5z" />
                             </svg>
                           </button>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-5 text-right">
                       <span className={`font-mono font-bold ${item.status === "Listed" ? "text-white" : "text-slate-500 line-through"}`}>
                         {(parseInt(item.price) / 100_000_000).toFixed(2)} CED
                       </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-5 text-right">
                      {item.status === "Listed" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_12px_rgba(74,222,128,0.2)]">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                          LISTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          SOLD
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}