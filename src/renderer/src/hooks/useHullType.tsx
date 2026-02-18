import hullTypeData from "../data-meta/hullType.json"; // adjust path if needed

export interface HullType {
  id: number;
  name: string;
  short: string;
  position: string;
  icon: string;
  tech: string | null;
  title: string;
  label: {
    [key: string]: string;
  };
}

type HullTypeMap = {
  [key: string]: HullType;
};

export const useHullType = () => {
  const data = hullTypeData as HullTypeMap;

  const getHullById = (id: number): HullType | undefined => {
    return data[String(id)];
  };

  const getHullByShort = (short: string): HullType | undefined => {
    return Object.values(data).find((hull) => hull.short === short);
  };

  const getAllHulls = (): HullType[] => {
    return Object.values(data);
  };

  return {
    getHullById,
    getHullByShort,
    getAllHulls,
  };
};
