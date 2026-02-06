import azLogo from "/build-icon/azurlanelogo.png";
import mk1Logo from "/build-icon/MK1.svg"; // stays in public
import "./App.css";
import "./inter.css";

function App() {
  return (
    <>
      <section className="introsection">
        <div>
          <a href="" target="_blank">
            <img src={mk1Logo} className="logo" alt="MK1 logo" />
          </a>
          <a href="" target="_blank">
            <img src={azLogo} className="logo azurlane" alt="Azur Lane logo" />
          </a>
        </div>
        <h1>Azur Lane CodeX</h1>
        <div className="card">
          <p>
            <code>FanBox App</code>
          </p>
          <p>Welcome to Azur CodeX.</p>
        </div>
      </section>
    </>
  );
}

export default App;
