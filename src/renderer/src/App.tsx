import "./App.css";
import "./inter.css";
import { Route, Routes } from "react-router-dom";
import { Nations } from "./pages/Nations";
import { Home } from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
      <Route path="/nation/:objectKey" element={<Nations />} />
    </Routes>
  );
}
