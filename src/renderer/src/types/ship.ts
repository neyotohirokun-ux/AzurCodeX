export interface ShipBaseStats {
  health: number;
  firepower: number;
  torpedo: number;
  antiair: number;
  aviation: number;
  reload: number;
  accuracy: number;
  evasion: number;
  speed: number;
  luck: number;
  asw: number;
}

export interface ShipData {
  id: number;
  gid: number;
  cid: number;
  name: string;
  normalizedName: string;
  codename: string;
  class: string;
  nationality: number;
  obtain: string[];
  type: number;
  rarity: number;
  armor: number;
  hexagon: string[];
  base: ShipBaseStats;
  growth: ShipBaseStats;
  equipment: Record<string, unknown>;
  skill: Record<string, unknown>;

  retrofit?: ShipRetrofit;
}

export interface ShipRetrofit {
  id: number;
  level: number;
  bonus: {
    [key: string]: number;
  };
  skill: number;
  skin: number;
  armor: number;
  hexagon: string[];
}

export interface ShipSkin {
  id: number;
  gid: number;
  name: string;
  type: string;
  desc: string;
  painting: string;
  painting_n: string;
  banner: string;
  chibi: string;
  icon: string;
  qicon: string;
  shipyard: string;
  spine_chibi: string;
  spine: string;
  live2d: string;
}

export interface ShipSkinData {
  skins: ShipSkin[];
}
