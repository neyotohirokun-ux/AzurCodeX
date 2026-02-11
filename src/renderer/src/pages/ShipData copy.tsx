import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useShipData } from "../hooks/useShipData";
import { useShipSkin } from "../hooks/useShipSkin";
import "./ShipData.css";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";

export const ShipData: React.FC = () => {
  const { nationKey, gid } = useParams<{ nationKey: string; gid: string }>();
  const { data, loading, error } = useShipData(nationKey!, Number(gid));
  const { skins } = useShipSkin(nationKey!, Number(gid));
  const [activeSkin, setActiveSkin] = useState(0);

  if (loading) return <p>Loading ship...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No ship data found.</p>;

  const activeSkinData = skins?.skins?.[activeSkin];

  return (
    <div className="shipdata-container">
      <Navigation />

      <section className="shipdata-sub-container">
        {/* Header Section */}
        <div className="shipdata-icon-and-name">
          {activeSkinData && (
            <img
              src={`${import.meta.env.BASE_URL}${activeSkinData.icon}`}
              alt={activeSkinData.name}
              className="shipdata-icon-img"
            />
          )}
          <h1>{data.name}</h1>
        </div>

        {/* Main Content */}
        <section className="shipdata-topcenter">
          <div className="shipdata-right-info">
            {/* Meta Information Row */}
            <section className="shipdata-meta-row">
              {/* Additional Info */}
              <div className="shipdata-meta-addinfo">
                <table className="shipdata-table">
                  <thead>
                    <tr>
                      <td>
                        <strong>Global Id:</strong>
                      </td>
                      <td>{data.gid}</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Code Name:</td>
                      <td>{data.codename}</td>
                    </tr>
                    <tr>
                      <td>Class:</td>
                      <td>{data.class}</td>
                    </tr>
                    <tr>
                      <td>Nation:</td>
                      <td>{data.nationality}</td>
                    </tr>
                    <tr>
                      <td>Rarity:</td>
                      <td>{data.rarity}</td>
                    </tr>
                    <tr>
                      <td>Type:</td>
                      <td>{data.type}</td>
                    </tr>
                    <tr>
                      <td>Armor:</td>
                      <td>{data.armor}</td>
                    </tr>
                    <tr>
                      <td>Obtain:</td>
                      <td>{data.obtain}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Shipyard Image */}
              <div className="shipdata-meta-img">
                {activeSkinData && (
                  <img
                    src={`${import.meta.env.BASE_URL}${activeSkinData.shipyard}`}
                    alt={activeSkinData.name}
                    className="shipdata-shipyard-img"
                  />
                )}
              </div>

              {/* Skin List */}
              <div className="shipdata-meta-skinlist">
                <h3>Skins</h3>
                <div className="shipdata-skins">
                  {skins?.skins.map((skin, index) => (
                    <div key={skin.id} className="shipdata-skin-card">
                      <img
                        src={`${import.meta.env.BASE_URL}${skin.icon}`}
                        alt={skin.name}
                        className={`shipdata-skin-img ${index === activeSkin ? "active" : ""}`}
                        onClick={() => setActiveSkin(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <h3>Skills</h3>
            <table className="shipdata-table">
              <thead>
                <tr>
                  <td>ID</td>
                  <td>Requirement</td>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.skill).map((skill: any) => (
                  <tr key={skill.id}>
                    <td>{skill.id}</td>
                    <td>{skill.requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Stats Section */}
        <section className="shipdata-stats-section">
          <h3>Stats</h3>
          <table className="shipdata-table">
            <thead>
              <tr>
                <td>Stat</td>
                <td>Base</td>
                <td>Growth</td>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data.base).map((key) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{data.base[key as keyof typeof data.base]}</td>
                  <td>{data.growth[key as keyof typeof data.growth]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Equipment Section */}
        <h3>Equipment Slots</h3>
        <table className="shipdata-table">
          <thead>
            <tr>
              <td>Slot</td>
              <td>Type</td>
              <td>Mount</td>
              <td>Efficiency</td>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.equipment).map(([slot, eq]: any) => (
              <tr key={slot}>
                <td>{slot}</td>
                <td>{eq.type.join(", ")}</td>
                <td>{eq.mount}</td>
                <td>{Math.round(eq.efficiency * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Footer />
    </div>
  );
};

export default ShipData;
