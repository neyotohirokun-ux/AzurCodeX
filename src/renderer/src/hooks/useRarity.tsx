import { useMemo } from "react";
import rarityList from "../data-meta/rarity.json";
import type { Rarity } from "../types/rarity";

// Create a map for O(1) lookup
const rarityMap: Record<number, Rarity> = Object.fromEntries(
  rarityList.map((r) => [r.id, r as Rarity]),
);

export function useRarity(rarityId?: number | string | null): Rarity | null {
  return useMemo(() => {
    if (rarityId == null) return null; // handles undefined or null
    return rarityMap[Number(rarityId)] ?? null;
  }, [rarityId]);
}
