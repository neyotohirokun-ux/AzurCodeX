import { useParams } from "react-router-dom";
import { useNation } from "../hooks/useNations";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import "./NationData.css";
import { ShipList } from "../components/ShipList";

export const NationData = () => {
  const { objectNationKey } = useParams();
  const { getNation } = useNation("en");

  if (!objectNationKey) return <p>Invalid nation.</p>;

  const nation = getNation(objectNationKey);

  if (!nation) return <p>Nation not found.</p>;

  return (
    <div className="nation-data-page">
      <Navigation />

      <div className="nation-data-container">
        {nation.logo && (
          <img
            src={`${import.meta.env.BASE_URL}${nation.logo}`}
            alt={nation.name}
            className="nation-data-logo"
          />
        )}

        <section>
          <h1>{nation.name}</h1>
          <p className="nation-code">{nation.code}</p>
          <h2>Nationality</h2>
          <table className="nation-table">
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
          </table>
        </section>

        {nation.desc && (
          <section>
            <h2>Description</h2>
            {Object.entries(nation.desc).map(([k, v]) => (
              <p key={k}>{v}</p>
            ))}
          </section>
        )}

        <ShipList nationKey={objectNationKey} />

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
