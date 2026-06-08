
export type UnifiedPrice = {
    symbol: string;
    price: number;
    change_value: number;
    change_percent: number;
    updated_at?: string;
    source?: "stock" | "crypto" | "forex";
  };
  