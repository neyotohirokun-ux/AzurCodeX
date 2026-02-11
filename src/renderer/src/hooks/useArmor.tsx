import { useMemo } from "react";
import ArmorList from "../data-meta/armor.json";
import type { Armor } from "../types/armor";

// Create a map for O(1) lookup
const armorMap: Record<number, Armor> = Object.fromEntries(
  ArmorList.map((r) => [r.id, r as Armor]),
);

export function useArmor(armorId?: number | string | null): Armor | null {
  return useMemo(() => {
    if (armorId == null) return null; // handles undefined or null
    return armorMap[Number(armorId)] ?? null;
  }, [armorId]);
}
