"use client";

export const MarketGrid = ({ listings, onBuy }: { listings: any[], onBuy: (s: string, id: string) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {listings.length === 0 ? (
      <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
        <p className="text-slate-400 font-medium italic">No active listings available.</p>
      </div>
    ) : (
      listings.map((item, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-2xl transition duration-500 group">
          <div className="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center text-slate-300 text-4xl font-black uppercase">
            {item.asset.name.slice(0, 1)}
          </div>
          <div className="px-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID #{item.id}</div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 truncate">{item.asset.name}</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Current Price</p>
                <p className="text-2xl font-black text-blue-600">{(parseInt(item.price) / 100_000_000).toFixed(2)} APT</p>
              </div>
              <button onClick={() => onBuy(item.seller, item.id)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold group-hover:bg-blue-600 transition">
                BUY
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);