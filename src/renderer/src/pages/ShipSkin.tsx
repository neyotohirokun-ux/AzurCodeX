import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShipSkin } from "../hooks/useShipSkin";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import Zoom from "../components/Zoom";
import SpinePlayer from "../components/spinePlayer";
import useLoadSpine from "../hooks/useLoadSpine";

import "./ShipSkin.css";

type ViewMode = "painting" | "painting_n" | "chibi" | "dynamic" | "live2d";

export const ShipSkin: React.FC = () => {
  const { nationKey, gid } = useParams<{ nationKey: string; gid: string }>();
  const navigate = useNavigate();

  const { skins, loading, error } = useShipSkin(nationKey!, Number(gid));

  const [activeSkin, setActiveSkin] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("painting");
  const [zoomEnabled, setZoomEnabled] = useState(true);

  const [spineReady, setSpineReady] = useState(false);

  // ---------------- Spine loader ----------------
  useLoadSpine(() => setSpineReady(true));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <p>Loading skins...</p>;
  if (error) return <p>{error}</p>;
  if (!skins || !skins.skins.length) return <p>No skins found.</p>;

  const activeSkinData = skins.skins[activeSkin];

  // ---------------- Feature availability ----------------
  const hasPaintingN = !!activeSkinData.painting_n;
  const hasChibi = !!activeSkinData.spine_chibi;
  const hasLive2D = !!activeSkinData.live2d;
  const hasZoom = !!activeSkinData.painting || !!activeSkinData.painting_n;

  const spineField = activeSkinData.spine as string | string[] | undefined;
  const chibiField = activeSkinData.spine_chibi as
    | string
    | string[]
    | undefined;

  const hasDynamic =
    !!spineField &&
    (typeof spineField === "string" ||
      (Array.isArray(spineField) && spineField.length > 0));

  const hasChibiSafe =
    !!chibiField &&
    (typeof chibiField === "string" ||
      (Array.isArray(chibiField) && chibiField.length > 0));

  const getMainSource = () => {
    switch (viewMode) {
      case "painting_n":
        return activeSkinData.painting_n;
      case "painting":
      default:
        return activeSkinData.painting;
    }
  };

  const getSpinePath = (field: string | string[] | undefined) => {
    if (!field) return "";
    return Array.isArray(field) ? field[0] : field;
  };

  return (
    <div className="shipskin-container">
      <Navigation />

      <div className="shipskin-layout">
        {/* LEFT SIDEBAR */}
        <aside className="shipskin-sidebar">
          <button className="shipskin-return-btn" onClick={() => navigate(-1)}>
            ← Return
          </button>

          {/* Control Buttons */}
          <div className="shipskin-controls">
            <button
              onClick={() => setViewMode("painting")}
              disabled={!hasZoom}
              className={
                viewMode === "painting" ? "active" : !hasZoom ? "disabled" : ""
              }
            >
              WB
            </button>

            <button
              onClick={() => hasPaintingN && setViewMode("painting_n")}
              disabled={!hasPaintingN}
              className={
                viewMode === "painting_n"
                  ? "active"
                  : !hasPaintingN
                    ? "disabled"
                    : ""
              }
            >
              WTB
            </button>

            <button
              onClick={() => hasZoom && setZoomEnabled((prev) => !prev)}
              disabled={!hasZoom}
              className={zoomEnabled ? "active" : !hasZoom ? "disabled" : ""}
            >
              Zoom
            </button>

            <button
              onClick={() => hasChibiSafe && setViewMode("chibi")}
              disabled={!hasChibiSafe}
              className={
                viewMode === "chibi"
                  ? "active"
                  : !hasChibiSafe
                    ? "disabled"
                    : ""
              }
            >
              Chibi
            </button>

            <button
              onClick={() => hasDynamic && setViewMode("dynamic")}
              disabled={!hasDynamic}
              className={
                viewMode === "dynamic"
                  ? "active"
                  : !hasDynamic
                    ? "disabled"
                    : ""
              }
            >
              Dynamic
            </button>

            <button
              onClick={() => hasLive2D && setViewMode("live2d")}
              disabled={!hasLive2D}
              className={
                viewMode === "live2d" ? "active" : !hasLive2D ? "disabled" : ""
              }
            >
              Live2D
            </button>
          </div>

          {/* Skin List */}
          <div className="shipskin-list">
            {skins.skins.map((skin, index) => (
              <div
                key={skin.id}
                className={`shipskin-card ${index === activeSkin ? "active" : ""}`}
                onClick={() => setActiveSkin(index)}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${skin.banner}`}
                  alt={skin.name}
                />
                <p>{skin.name}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT MAIN PREVIEW */}
        <main className="shipskin-main">
          {(viewMode === "painting" || viewMode === "painting_n") && hasZoom ? (
            zoomEnabled ? (
              <Zoom
                src={`${import.meta.env.BASE_URL}${getMainSource()}`}
                enabled={true}
              />
            ) : (
              <img
                src={`${import.meta.env.BASE_URL}${getMainSource()}`}
                alt={activeSkinData.name}
                className="shipskin-main-img"
              />
            )
          ) : viewMode === "dynamic" && hasDynamic ? (
            spineReady ? (
              <SpinePlayer
                key={getSpinePath(spineField)}
                spinePath={getSpinePath(spineField)}
                animationName="normal"
                width={600}
                height={600}
              />
            ) : (
              <p>Loading Spine...</p>
            )
          ) : viewMode === "chibi" && hasChibiSafe ? (
            spineReady ? (
              <SpinePlayer
                key={getSpinePath(chibiField)}
                spinePath={getSpinePath(chibiField)}
                animationName="idle"
                width={400}
                height={400}
              />
            ) : (
              <p>Loading Spine...</p>
            )
          ) : viewMode === "live2d" && hasLive2D ? (
            <p>Live2D not implemented yet</p>
          ) : (
            <img
              src={`${import.meta.env.BASE_URL}${getMainSource()}`}
              alt={activeSkinData.name}
              className="shipskin-main-img"
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ShipSkin;
