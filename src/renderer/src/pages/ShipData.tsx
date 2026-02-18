import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useShipData } from "../hooks/useShipData";
import { useShipSkin } from "../hooks/useShipSkin";
import { useRarity } from "../hooks/useRarity";
import { useArmor } from "../hooks/useArmor";
import { useNation } from "../hooks/useNations";
import { useHullType } from "../hooks/useHullType";
import "./ShipData.css";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/footer";
import { LoadingImage } from "../components/LoadingImage";

export const ShipData: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { nationKey, gid } = useParams<{ nationKey: string; gid: string }>();
  const { data, loading, error } = useShipData(nationKey!, Number(gid));
  const { skins } = useShipSkin(nationKey!, Number(gid));
  const [activeSkin, setActiveSkin] = useState(0);
  const rarityData = useRarity(data?.rarity);
  const armorData = useArmor(data?.armor);
  const { getNation } = useNation("en"); // lang can be dynamic if needed
  const nationData = getNation(String(data?.nationality));
  const { getHullById } = useHullType();
  const hull = getHullById(Number(data?.type));

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
            <LoadingImage
              src={`${import.meta.env.BASE_URL}${activeSkinData.icon}`}
              alt={activeSkinData.name}
              className="shipdata-icon-img"
            />
          )}
          <h1>{data.name}</h1>
        </div>

        {/* Main Content */}
        <section className="shipdata-topcenter">
          <div className="shipdata-info">
            {/* Meta Information Row */}
            <div className="shipdata-meta-row">
              {/* Additional Info */}
              <div className="shipdata-meta-addinfo">
                <table className="shipdata-toptable">
                  <thead>
                    <tr>
                      <td>
                        <strong>Global ID:</strong>
                      </td>
                      <td>{data.gid}</td>
                    </tr>
                    <tr>
                      <td>ID:</td>
                      <td>{data.id}</td>
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
                      <td>{nationData ? nationData.name : "Unknown Nation"}</td>
                    </tr>
                    <tr>
                      <td>Rarity:</td>
                      <td>
                        {rarityData ? (
                          <>
                            {rarityData.name} {rarityData.stars}
                          </>
                        ) : (
                          "Unknown"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Type:</td>
                      <td>
                        {hull ? `(${hull.short}) ${hull.name}` : "Unknown"}
                      </td>
                    </tr>
                    <tr>
                      <td>Armor:</td>
                      <td>{armorData ? armorData.name : "Unknown"}</td>
                    </tr>
                    <tr>
                      <td>Obtain:</td>
                      <td>
                        {Array.isArray(data.obtain)
                          ? data.obtain.join(", ")
                          : data.obtain}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Shipyard Image */}
              <div className="shipdata-meta-img">
                {activeSkinData && (
                  <LoadingImage
                    src={`${import.meta.env.BASE_URL}${activeSkinData.shipyard}`}
                    alt={activeSkinData.name}
                    className="shipdata-shipyard-img"
                  />
                )}
              </div>

              {/* Skin List */}
              <div className="shipdata-meta-skinlist">
                <Link to={`/shipskin/${nationKey}/${gid}`}>
                  <h3 className="shipdata-skin-link">View Skins</h3>
                </Link>

                <div className="shipdata-skins">
                  {skins?.skins.map((skin, index) => (
                    <div key={skin.id} className="shipdata-skin-card">
                      <LoadingImage
                        src={`${import.meta.env.BASE_URL}${skin.icon}`}
                        alt={skin.name}
                        className={`shipdata-skin-img ${index === activeSkin ? "active" : ""}`}
                        onClick={() => setActiveSkin(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
