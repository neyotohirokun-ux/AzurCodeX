import React from "react";
import { useNavigate } from "react-router-dom";
import { useShipList } from "../hooks/useShipList";
import { useShipData } from "../hooks/useShipData";
import { useShipSkin } from "../hooks/useShipSkin";
import "./ShipList.css";

interface ShipListProps {
  nationKey: string;
}

export const ShipList: React.FC<ShipListProps> = ({ nationKey }) => {
  const { gids, loading, error } = useShipList(nationKey);

  if (loading) return <p>Loading ships...</p>;
  if (error) return <p>{error}</p>;
  if (gids.length === 0) return <p>No ships available.</p>;

  return (
    <div className="ship-list-container">
      <h2>Shipyard</h2>
      {gids.map((gid) => (
        <ShipCard key={gid} nationKey={nationKey} gid={gid} />
      ))}
    </div>
  );
};

interface ShipCardProps {
  nationKey: string;
  gid: number;
}

const ShipCard: React.FC<ShipCardProps> = ({ nationKey, gid }) => {
  const { data } = useShipData(nationKey, gid);
  const { skins } = useShipSkin(nationKey, gid);
  const navigate = useNavigate();

  if (!data || !skins) return <div className="ship-card">Loading...</div>;

  // Use the first skin as primary (shipyard image)
  const primarySkin = skins.skins[0];

  return (
    <div
      className="ship-card"
      onClick={() => navigate(`/shipdata/${nationKey}/${gid}`)}
    >
      <img
        src={`${import.meta.env.BASE_URL}${primarySkin.shipyard}`}
        alt={data.name}
        className="ship-card-img"
      />
      <h3 className="ship-card-name">{data.name}</h3>
      <p className="ship-card-class">{data.class}</p>
      <p className="ship-card-type">Rarity: {data.rarity}</p>
    </div>
  );
};
