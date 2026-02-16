import { useEffect, useState } from "react";
import type { ShipData } from "../types/ship";

export const useShipData = (nationKey: string, gid: number | string) => {
  const [data, setData] = useState<ShipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nationKey || !gid) return;

    setLoading(true);

    fetch(`${import.meta.env.BASE_URL}data-ship/${nationKey}/${gid}/data.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ship data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [nationKey, gid]);

  return { data, loading, error };
};
