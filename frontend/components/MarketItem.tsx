export const MarketItem = ({ item, onBuy }: { item: any, onBuy: (s: string, id: string) => void }) => (
    <div className="bg-white group rounded-3xl border p-2 hover:shadow-2xl transition-all duration-300">
      <div className="aspect-square bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold">VERIFIED</div>
      </div>
      <div className="px-4 pb-4">
        <div className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-widest">ID #{item.id}</div>
        <div className="font-bold text-gray-900 mb-4 truncate">Asset Name: {item.asset}</div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Price</div>
            <div className="text-xl font-black text-blue-600">{parseInt(item.price) / 100_000_000} APT</div>
          </div>
          <button onClick={() => onBuy(item.seller, item.id)} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition">BUY</button>
        </div>
      </div>
    </div>
  );