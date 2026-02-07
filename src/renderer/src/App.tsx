import azLogo from "/img/iconlogo/azurlanelogo.png";
import mk1Logo from "/img/iconlogo/MK1.svg"; // stays in public
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
          <p>Neonic Media / Zero Empire</p>
        </div>
      </section>
      <footer>
        <hr />
        <div className="disclaimer">
          <p>
            Trademarks:
            <a
              href="http://manjuu.com/en/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              {/* This "" is for spaces */}
              Manjuu
            </a>
            ,
            <a
              href="https://yo-star.com/en-us"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              Yostar
            </a>
            , and
            <a
              href="https://www.yongshigames.com/#/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              Yongshi
            </a>
            .
          </p>
          <p>© 2026 Azur Lane CodeX</p>
          <p>
            <a href="/privacy">Privacy Policy</a> |{" "}
            <a href="/terms">Terms of Service</a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
