"use client";

import Link from "next/link";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition">C</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Cedera Market</h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors ${pathname === "/" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Explore
          </Link>
          <Link 
            href="/create" 
            className={`text-sm font-medium transition-colors ${pathname === "/create" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Create Asset
          </Link>
          <Link href="/my-assets" className="text-gray-500 hover:text-gray-900 font-medium">
            My Assets
          </Link>
        </div>

        {/* Wallet Section */}
        <div className="flex items-center gap-4">
          <WalletSelector />
        </div>
      </div>
    </nav>
  );
}