// Normalised shape used by the market header ticker.
// Each source (crypto / forex / stocks) is mapped to this before rendering.
export type MarketItem = {
  label: string;
  value: number;
  d: number;  // absolute change
  dp: number; // percentage change
};

export function MarketTickerItem({ item }: { item: MarketItem }) {
  const isPositive = item.dp >= 0;

  return (
    <div className="flex items-center justify-center border-r-2 border-neutral-500">
      <div className="flex flex-col items-center gap-1 text-xs sm:text-sm md:text-md">

        <div className="flex items-center gap-2">
          <span className="font-semibold truncate max-w-[100px] md:max-w-none">
            {item.label}
          </span>
          <span className="text-gray-200">{item.value.toFixed(2)}</span>
        </div>

        <span
          className={`text-[0.7rem] sm:text-xs ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? "▲" : "▼"} {item.dp.toFixed(2)}% ({item.d.toFixed(2)})
        </span>

      </div>
    </div>
  );
}
