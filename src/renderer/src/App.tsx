import { useState } from "react";
import azLogo from "/build-icon/azurlanelogo.png";
import mk1Logo from "/build-icon/MK1.svg"; // stays in public
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
