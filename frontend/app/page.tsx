"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "./constant";

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

interface MarketItem {
  id: string;
  price: string;
  seller: string;
  asset: {
    name: string;
    content_uri: string;
    id: string;
  };
}

export default function Home() {
  const { account, signAndSubmitTransaction } = useWallet();
  
  // RAW DATA (From Blockchain)
  const [listings, setListings] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(false);

  // FILTERS STATE
  const [searchText, setSearchText] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // LOAD DATA
  const loadMarketData = useCallback(async () => {
    setLoading(true);
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::market_v6::Listings`
      });
      // @ts-ignore
      setListings(resource.items);
    } catch (e) {
      console.log("Market empty or not init");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  // BUY FUNCTION
  const handleBuy = async (listingId: string, price: string) => {
    if (!account) return alert("Connect wallet first!");
    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v6::buy_item`,
          typeArguments: [],
          functionArguments: [listingId],
        }
      });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert("Bought successfully! Check 'My Assets'.");
      loadMarketData();
    } catch (e) {
      console.error("Buy failed:", e);
    }
  };

  // FILTERING LOGIC 
  const filteredListings = listings
    .filter((item) => {
      // 1. Search Name
      if (searchText && !item.asset.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      
      // 2. Filter Seller
      if (sellerAddress && !item.seller.includes(sellerAddress)) return false;

      // 3. Filter Price
      const priceInApt = parseInt(item.price) / 100_000_000;
      if (minPrice && priceInApt < parseFloat(minPrice)) return false;
      if (maxPrice && priceInApt > parseFloat(maxPrice)) return false;

      return true;
    })
    .sort((a, b) => {
      // 4. Sort Price
      const priceA = parseInt(a.price);
      const priceB = parseInt(b.price);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

  // CLEAR ALL FILTERS
  const clearFilters = () => {
    setSearchText("");
    setMinPrice("");
    setMaxPrice("");
    setSellerAddress("");
    setSortOrder("asc");
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      
      {/* HEADER */}
      <div className="mb-10 text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">AI Art Marketplace</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Discover, collect, and trade unique AI-generated assets on Aptos.
        </p>
      </div>

      {/*FILTER BAR*/}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* SEARCH */}
          <div className="relative">
             <input
               type="text"
               placeholder="Search assets..."
               className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
             />
             <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          {/* PRICE RANGE */}
          <div className="flex gap-2">
            <input
               type="number"
               placeholder="Min APT"
               className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
               value={minPrice}
               onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
               type="number"
               placeholder="Max APT"
               className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
               value={maxPrice}
               onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {/* SELLER ADDRESS */}
          <input
             type="text"
             placeholder="Filter by Seller Address (0x...)"
             className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
             value={sellerAddress}
             onChange={(e) => setSellerAddress(e.target.value)}
          />

          {/* SORT & CLEAR */}
          <div className="flex gap-2">
            <select
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white cursor-pointer"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
            
            <button 
              onClick={clearFilters}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Clear Filters"
            >
              ✕
            </button>
          </div>

        </div>
      </div>

      {/* STATS & REFRESH*/}
      <div className="flex items-center justify-between mb-8">
        <div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live Listings</h3>
           <span className="text-sm text-gray-500 dark:text-gray-400">
             Showing {filteredListings.length} of {listings.length} Assets
           </span>
        </div>
        <button 
          onClick={loadMarketData} 
          className="px-6 py-2.5 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        >
          {loading ? "Refreshing..." : "Refresh Grid"}
        </button>
      </div>

     // Grid
      {filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-400 text-lg">
            {listings.length === 0 ? "No assets listed yet." : "No matches found. Try clearing filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredListings.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-900">
                 <img 
                   src={item.asset.content_uri} 
                   alt={item.asset.name}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
              </div>
              <div className="px-2 pb-2">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">{item.asset.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                  Owner: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    {(parseInt(item.price) / 100_000_000).toFixed(2)} APT
                  </span>
                  <button 
                    onClick={() => handleBuy(item.id, item.price)}
                    className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}