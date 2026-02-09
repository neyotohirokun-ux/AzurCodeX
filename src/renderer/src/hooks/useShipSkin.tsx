import { useEffect, useState } from "react";
import type { ShipSkinData } from "../types/ship";

export const useShipSkin = (nationKey: string, gid: number | string) => {
  const [skins, setSkins] = useState<ShipSkinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nationKey || !gid) return;

    setLoading(true);

    fetch(`/data-ship/${nationKey}/${gid}/skin.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ship skins");
        return res.json();
      })
      .then(setSkins)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [nationKey, gid]);

  return { skins, loading, error };
};
