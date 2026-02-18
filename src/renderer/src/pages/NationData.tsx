import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNation } from "../hooks/useNations";
import { useNavigation } from "../components/NavigationContext";
import { Footer } from "../components/footer";
import { ShipList } from "../components/ShipList";
import "./NationData.css";

export const NationData: React.FC = () => {
  // ✅ Hooks first
  const { objectNationKey } = useParams<{ objectNationKey: string }>();
  const { getNation } = useNation("en");
  const { crumbs, setCrumbs } = useNavigation();

  // ✅ Always call hooks before conditional returns
  const nation = objectNationKey ? getNation(objectNationKey) : null;

  // ✅ Set breadcrumbs safely, avoid infinite loop
  useEffect(() => {
    if (!nation || !objectNationKey) return;

    const newCrumbs = [
      { label: "Nations", path: "/nationlist/0" },
      { label: nation.name, path: `/nationdata/${objectNationKey}` },
    ];

    // Only update if crumbs actually changed
    const isSame =
      crumbs.length === newCrumbs.length &&
      crumbs.every(
        (c, i) =>
          c.label === newCrumbs[i].label && c.path === newCrumbs[i].path,
      );

    if (!isSame) {
      setCrumbs(newCrumbs);
    }
  }, [nation, objectNationKey, crumbs, setCrumbs]);

  // ✅ Conditional rendering after hooks
  if (!objectNationKey) return <p>Invalid nation.</p>;
  if (!nation) return <p>Nation not found.</p>;

  return (
    <div className="nation-data-page">
      <div className="nation-data-container">
        <h1>{nation.name.toUpperCase()}</h1>

        <div className="nation-data-content">
          {/* Description Section */}
          {nation.desc && (
            <section className="nation-desc-section">
              <h2>Description</h2>
              {Object.entries(nation.desc).map(([k, v]) => (
                <p key={k}>{v}</p>
              ))}
            </section>
          )}

          {/* Nation Info Section */}
          <section className="nation-data-section">
            {nation.logo && (
              <img
                src={`${import.meta.env.BASE_URL}${nation.logo}`}
                alt={nation.name}
                className="nation-data-logo"
              />
            )}

            <div className="nation-minor-info">
              <p className="nation-code">Name: {nation.name}</p>
              <p className="nation-code">Code: {nation.code}</p>
              <p className="nation-code">Nation Id: {nation.id}</p>
            </div>

            <h2>Nationality</h2>
            <table className="nation-table">
              <tbody>
                <tr>
                  <td>Prefix:</td>
                  <td>{nation.nationality.prefix}</td>
                </tr>
                <tr>
                  <td>Faction:</td>
                  <td>{nation.nationality.faction}</td>
                </tr>
                <tr>
                  <td>Type:</td>
                  <td>{nation.nationality.type}</td>
                </tr>
                <tr>
                  <td>Belligerent:</td>
                  <td>{nation.nationality.belligerent}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* Shipyard Section */}
        <h2>Shipyard</h2>
        <ShipList nationKey={objectNationKey} />

        {/* Trivia Section */}
        {nation.trivia && (
          <section>
            <h2>Trivia</h2>
            <ul>
              {Object.entries(nation.trivia).map(([k, v]) => (
                <li key={k}>{v}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NationData;
