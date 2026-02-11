export interface Rarity {
  id: number;
  name: string;
  stars: string;
  equip_stars?: string;

  tag: string;
  tag2?: string | null;

  ico: string;
  ico2?: string | null;

  bg: string;
  bgMETA?: string | null;

  bg_rarity1: string;
  bg_rarity2: string;

  icon_frame1: string;
  icon_frame2: string;

  rarity_frame: string;

  starLev_bg1: string;
  starLev_bg2?: string | null;

  starLev_card: string;
}
