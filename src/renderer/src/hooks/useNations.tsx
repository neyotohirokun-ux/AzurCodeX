import { useState, useEffect } from "react";
import nationsData from "../data-nation/nations.json";

export type Language = "en" | "cn" | "jp" | "kr";

export interface NationEntry {
  id: number;
  code: string | null;
  logo: string | null;
  name: Partial<Record<Language, string | null>>;
  nationality: {
    prefix?: string | null;
    belligrent?: string | null;
    faction?: string | null;
    type?: string | null;
  };
  desc?: Record<string, string>;
  trivia?: Record<string, string>;
  [extraField: string]: unknown;
}

// Lookup by object key (string)
export const useNation = (lang: Language = "en") => {
  const [nations, setNations] = useState<Record<string, NationEntry>>({});

  useEffect(() => {
    setNations(nationsData as Record<string, NationEntry>);
  }, []);

  const getNation = (objectKey: string) => {
    const nation = nations[objectKey];
    if (!nation) return null;

    return {
      ...nation,
      name: nation.name[lang] || nation.name.en || "",
    };
  };

  return { nations, getNation };
};
