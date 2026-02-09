import "./App.css";
import "./inter.css";
import { Route, Routes } from "react-router-dom";
import { NationList } from "./pages/NationList";
import { Home } from "./pages/Home";
import { NationData } from "./pages/NationData";
import { ShipData } from "./pages/ShipData";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
      <Route path="/nationlist/:objectKey" element={<NationList />} />
      <Route path="/nationdata/:objectNationKey" element={<NationData />} />
      <Route path="/shipdata/:nationKey/:gid" element={<ShipData />} />
    </Routes>
  );
}
