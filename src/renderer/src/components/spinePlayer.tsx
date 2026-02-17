import React, { useEffect, useRef, useState } from "react";

interface SpinePlayerProps {
  spinePath: string; // folder containing .skel + .atlas + .png
  animationName: string;
  width: number;
  height: number;
}

const SpinePlayer: React.FC<SpinePlayerProps> = ({
  spinePath,
  animationName,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!(window as any).spine) {
      setError("Spine not loaded");
      return;
    }

    let spineInstance: any;
    let animationFrameId: number;

    const loadSpineFolder = async () => {
      try {
        const spine = (window as any).spine;

        // Get base name from folder
        const folderName = spinePath.split("/").pop()!; // e.g., "aisekesi_7"
        const atlasFile = `${folderName}.atlas`;
        const skelFile = `${folderName}.skel`;

        // --------- Load atlas ----------
        const atlasText = await fetch(
          `${import.meta.env.BASE_URL}${spinePath}/${atlasFile}`,
        ).then((r) => r.text());

        const atlas = new spine.TextureAtlas(
          atlasText,
          (line: string, callback: any) => {
            const img = new Image();
            img.src = `${import.meta.env.BASE_URL}${spinePath}/${line}`;
            img.onload = () => callback(new spine.Texture(img));
            img.onerror = () => setError(`Failed to load texture: ${line}`);
          },
        );

        // --------- Load skeleton (.skel) ----------
        const skelBuffer = await fetch(
          `${import.meta.env.BASE_URL}${spinePath}/${skelFile}`,
        ).then((r) => r.arrayBuffer());

        const skeletonData = new spine.SkeletonBinary(
          new spine.AtlasAttachmentLoader(atlas),
        ).readSkeletonData(new Uint8Array(skelBuffer));

        // --------- Setup canvas ----------
        const canvas = canvasRef.current!;
        const gl = canvas.getContext("webgl", { alpha: true })!;
        const renderer = new spine.SceneRenderer(canvas, gl);

        const skeleton = new spine.Skeleton(skeletonData);
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();

        const stateData = new spine.AnimationStateData(skeleton.data);
        const state = new spine.AnimationState(stateData);
        state.setAnimation(0, animationName, true);

        let lastTime = Date.now() / 1000;

        const render = () => {
          const now = Date.now() / 1000;
          const delta = now - lastTime;
          lastTime = now;

          state.update(delta);
          state.apply(skeleton);
          skeleton.updateWorldTransform();

          gl.clear(gl.COLOR_BUFFER_BIT);
          renderer.drawSkeleton(skeleton);

          animationFrameId = requestAnimationFrame(render);
        };

        render();
        spineInstance = { skeleton, state, renderer };
      } catch (e: any) {
        console.error(e);
        setError("Failed to load Spine folder: " + e.message);
      }
    };

    loadSpineFolder();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      spineInstance = null;
    };
  }, [spinePath, animationName]);

  if (error) return <p>{error}</p>;
  return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};

export default SpinePlayer;
