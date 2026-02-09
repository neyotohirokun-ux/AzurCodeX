import React from "react";
import { useParams } from "react-router-dom";
import { useShipData } from "../hooks/useShipData";
import { useShipSkin } from "../hooks/useShipSkin";
import "./ShipData.css";
import { Navigation } from "../components/navigation";

export const ShipData: React.FC = () => {
  const { nationKey, gid } = useParams<{ nationKey: string; gid: string }>();
  const { data, loading, error } = useShipData(nationKey!, Number(gid));
  const { skins } = useShipSkin(nationKey!, Number(gid));

  if (loading) return <p>Loading ship...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No ship data found.</p>;

  return (
    <div className="shipdata-container">
      <Navigation />
      <h1>{data.name}</h1>
      <h2>{data.class}</h2>
      <p>
        <strong>Rarity:</strong> {data.rarity}
      </p>
      <p>
        <strong>Type:</strong> {data.type}
      </p>
      <p>
        <strong>Armor:</strong> {data.armor}
      </p>

      <h3>Base Stats</h3>
      <table className="shipdata-table">
        <tbody>
          {Object.entries(data.base).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Growth Stats</h3>
      <table className="shipdata-table">
        <tbody>
          {Object.entries(data.growth).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Skins</h3>
      <div className="shipdata-skins">
        {skins?.skins.map((skin) => (
          <div key={skin.id} className="ship-skin-card">
            <img
              src={`${import.meta.env.BASE_URL}${skin.shipyard}`}
              alt={skin.name}
              className="ship-skin-img"
            />
            <p>{skin.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipData;
