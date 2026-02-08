import React, { useState } from "react";
import { useNation } from "../hooks/useNations";
import { Link } from "react-router-dom";
import "./Nations.css";
import "./NationTypes.css";

export const Nations: React.FC = () => {
  const { nations, getNation } = useNation("en");
  const [groupByFaction, setGroupByFaction] = useState(false);

  if (!nations || Object.keys(nations).length === 0)
    return <p>Loading nations...</p>;

  // Group nations by either type or faction
  const nationsByGroup: Record<string, any[]> = {};
  Object.keys(nations).forEach((key) => {
    const nation = getNation(key);
    if (!nation) return;

    const groupKey = groupByFaction
      ? nation.nationality?.faction || "Unknown"
      : nation.nationality?.type || "Unknown";

    if (!nationsByGroup[groupKey]) nationsByGroup[groupKey] = [];
    nationsByGroup[groupKey].push(nation);
  });

  return (
    <div className="nations-container">
      <div className="controls">
        <button>
          <Link to="/" className="btn-link">
            Return
          </Link>
        </button>

        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={groupByFaction}
            onChange={() => setGroupByFaction(!groupByFaction)}
          />
          <span className="slider"></span>
          <span className="switch-label">
            {groupByFaction ? "Faction" : "Type"}
          </span>
        </label>
      </div>
      <h1 className="page-title">Nations</h1>

      {Object.keys(nationsByGroup).map((group) => (
        <div
          key={group}
          className={`nation-type-container type-${group.toLowerCase()}`}
        >
          <h2 className="type-title">{group}</h2>
          <div className="type-nations">
            {nationsByGroup[group].map((nation) => (
              <div key={nation.id} className="nation-card">
                {nation.logo && (
                  <img
                    src={nation.logo}
                    alt={nation.name}
                    className="nation-logo"
                  />
                )}
                <h3>{nation.name.toUpperCase()}</h3>
                <p className="nation-code">{nation.code}</p>
                <p className="nation-prefix">{nation.nationality.prefix}</p>
                <p className="nation-faction">
                  {groupByFaction
                    ? nation.nationality.type
                    : nation.nationality.faction}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Nations;
