import { useEffect, useState } from "react";

export const useShipList = (nationKey: string) => {
  const [gids, setGids] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nationKey) return;

    setLoading(true);

    fetch(`${import.meta.env.BASE_URL}data-ship/${nationKey}/ship-index.json`) // 🔹 fetch each nation's ship-index.json
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ship index");
        return res.json();
      })
      .then((data: number[]) => setGids(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [nationKey]);

  return { gids, loading, error };
};
