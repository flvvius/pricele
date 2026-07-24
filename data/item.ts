export interface Item {
  id: string;
  name: string;
  /** Month this item is active, "YYYY-MM". */
  month: string;
  imageUrl: string;
}

// The active item for the MVP. One item per month (§1).
export const ACTIVE_ITEM: Item = {
  id: "coke-330ml",
  name: "Coca-Cola (330ml can)",
  month: "2026-07",
  imageUrl: "/items/coke.svg",
};
