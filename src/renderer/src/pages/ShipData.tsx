import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useShipData } from "../hooks/useShipData";
import { useShipSkin } from "../hooks/useShipSkin";
import { useRarity } from "../hooks/useRarity";
import { useArmor } from "../hooks/useArmor";
import { useNation } from "../hooks/useNations";
import { useHullType } from "../hooks/useHullType";
import { useSkill } from "../hooks/useSkill";
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
  const { getSkillById } = useSkill();

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
          </div>
        </section>

        <section className="shipdata-skill-section">
          <h3>Skills</h3>
          <div className="shipdata-skill-container">
            {/* Left: Table */}
            <table className="shipdata-table shipdata-skill-table">
              <thead>
                <tr>
                  <td>ID</td>
                  <td>Requirement</td>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.skill).map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Right: Skill Icons and Descriptions */}

            <div className="shipdata-skill-info">
              {Object.values(data.skill).map((s: any) => {
                const skillInfo = getSkillById(Number(s.id));
                if (!skillInfo) return null;
                return (
                  <div key={s.id} className="shipdata-skill-card">
                    <img
                      src={`${import.meta.env.BASE_URL}${skillInfo.icon}`}
                      alt={skillInfo.name}
                      className="shipdata-skill-icon"
                    />
                    <div className="shipdata-skill-details">
                      <strong>{skillInfo.name}</strong>
                      <p>{skillInfo.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
                {data.retrofit && <td>Retrofit</td>}
              </tr>
            </thead>

            <tbody>
              {Object.keys(data.base).map((key) => {
                const base = data.base[key as keyof typeof data.base] as number;
                const growthValue = data.growth[
                  key as keyof typeof data.growth
                ] as number;
                const growthDiff = growthValue - base;

                // Growth display
                let growthDisplay;
                if (growthDiff === 0) {
                  growthDisplay = growthValue.toLocaleString();
                } else {
                  growthDisplay = (
                    <span className="stat-additional">
                      (↑){growthValue.toLocaleString()}
                    </span>
                  );
                }

                // Retrofit display
                let retrofitDisplay = null;
                if (data.retrofit) {
                  const retrofitBonus = (data.retrofit.bonus?.[
                    key as keyof typeof data.retrofit.bonus
                  ] ?? 0) as number;
                  const retrofitValue = growthValue + retrofitBonus;

                  if (retrofitBonus === 0) {
                    retrofitDisplay = retrofitValue.toLocaleString();
                  } else {
                    retrofitDisplay = (
                      <span className="stat-additional">
                        (↑){retrofitValue.toLocaleString()}
                      </span>
                    );
                  }
                }

                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{base.toLocaleString()}</td>
                    <td>{growthDisplay}</td>
                    {data.retrofit && <td>{retrofitDisplay}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Retrofit Section */}
        {data.retrofit && (
          <section className="shipdata-retrofit-section">
            <h3>Retrofit</h3>

            <p>
              <strong>Required Level:</strong> {data.retrofit.level}
            </p>

            <table className="shipdata-table">
              <thead>
                <tr>
                  <td>Bonus</td>
                  <td>Value</td>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.retrofit.bonus).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      {typeof value === "number" && value < 1
                        ? `${Math.round(value * 100)}%`
                        : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

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
