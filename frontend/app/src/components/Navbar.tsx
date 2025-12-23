"use client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const Navbar = () => {
  const { connected, account, connect, disconnect, wallets } = useWallet();

  return (
    <nav className="flex justify-between items-center py-6 px-10 bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="text-3xl font-black tracking-tighter text-blue-600">CEDERA</div>
      <div className="flex items-center gap-4">
        {!connected ? (
          wallets.filter(w => w.readyState === "Installed").map(w => (
            <button key={w.name} onClick={() => connect(w.name)} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition duration-300">
              Connect {w.name}
            </button>
          ))
        ) : (
          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-full border">
            <span className="pl-4 text-xs font-mono text-slate-500">
              {account?.address.toString().slice(0, 10)}...
            </span>
            <button onClick={disconnect} className="bg-white text-red-500 px-5 py-1.5 rounded-full border shadow-sm text-xs font-bold hover:bg-red-50">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};