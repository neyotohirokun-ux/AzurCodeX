import React, { useEffect, useRef, useState, useCallback } from "react";

interface SpineViewerProps {
  spinePath: string;
  skeletonFile: string;
  atlasFile: string;
  animationName?: string;
  showControls?: boolean;
}

const SpineViewer: React.FC<SpineViewerProps> = ({
  spinePath,
  skeletonFile,
  atlasFile,
  animationName = "normal",
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const initAttemptRef = useRef(0);
  const animationFrameIdRef = useRef<number>(0);

  // Refs
  const spineRef = useRef<any>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const skeletonRef = useRef<any>(null);
  const stateRef = useRef<any>(null);
  const skeletonDataRef = useRef<any>(null);
  const currentExpressionRef = useRef<string>("normal");
  const currentAnimationRef = useRef<string>("normal");

  // State
  const [animations, setAnimations] = useState<string[]>([]);
  const [availableSkins, setAvailableSkins] = useState<string[]>([]);
  const [expressionSkins, setExpressionSkins] = useState<string[]>(["normal"]);
  const [currentAnimation, setCurrentAnimation] = useState(animationName);
  const [currentExpression, setCurrentExpression] = useState<string>("normal");
  const [isPlaying, setIsPlaying] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    fps: 0,
    width: 0,
    height: 0,
    scale: 1,
    expression: "normal",
    hasVertexColors: false,
    premultipliedAlpha: true,
    blushSlots: [] as string[],
    colorAnimations: [] as string[],
    cheekColor: "rgba(1,1,1,1)",
    currentSkin: "default",
    availableAttachments: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [loadProgress, setLoadProgress] = useState({
    atlas: 0,
    skeleton: 0,
    textures: 0,
  });

  // ========== SIMPLE HOOKS ==========

  const findAllSkins = useCallback((skeletonData: any) => {
    const skins: string[] = [];
    if (!skeletonData || !skeletonData.skins) return skins;
    skeletonData.skins.forEach((skin: any) => skins.push(skin.name));
    return skins;
  }, []);

  const findExpressionSkins = useCallback((skeletonData: any) => {
    const expressions = new Set<string>();
    if (!skeletonData) return [];

    // Check all slots for blush/cheek slots
    const cheekSlotNames = [
      "11111",
      "cheek",
      "blush",
      "face",
      "saihong",
      "yanhong",
    ];

    // Collect all slot indices that might contain expressions
    const cheekSlotIndices: number[] = [];
    if (skeletonData.slots) {
      skeletonData.slots.forEach((slot: any, index: number) => {
        const slotName = slot.name.toLowerCase();
        if (
          cheekSlotNames.some((name) => slotName.includes(name.toLowerCase()))
        ) {
          cheekSlotIndices.push(index);
        }
      });
    }

    if (cheekSlotIndices.length === 0) {
      return [];
    }

    // Check all skins for attachments on these slots
    const allSkins = skeletonData.skins
      ? [skeletonData.defaultSkin, ...skeletonData.skins]
      : [skeletonData.defaultSkin];

    allSkins.forEach((skin: any) => {
      if (!skin || !skin.attachments) return;

      cheekSlotIndices.forEach((slotIndex: number) => {
        const slotAttachments = skin.attachments[slotIndex];
        if (slotAttachments) {
          Object.keys(slotAttachments).forEach((attachmentName: string) => {
            // Include expression-like attachments (not the default slot name)
            if (
              !cheekSlotNames.some(
                (name) => attachmentName.toLowerCase() === name.toLowerCase(),
              )
            ) {
              expressions.add(attachmentName);
            }
          });
        }
      });
    });

    return Array.from(expressions);
  }, []);

  const debugAllAttachments = useCallback((skeletonData: any) => {
    const attachments: string[] = [];
    if (!skeletonData || !skeletonData.defaultSkin) return attachments;
    const defaultSkin = skeletonData.defaultSkin;
    if (!defaultSkin.attachments) return attachments;

    const cheekSlotNames = [
      "11111",
      "cheek",
      "blush",
      "face",
      "saihong",
      "yanhong",
    ];
    let targetSlotIndex = -1;

    skeletonData.slots.forEach((slot: any, index: number) => {
      const slotName = slot.name.toLowerCase();
      if (
        cheekSlotNames.some((name) => slotName.includes(name.toLowerCase()))
      ) {
        targetSlotIndex = index;
      }
    });

    if (targetSlotIndex !== -1) {
      const slotAttachments = defaultSkin.attachments[targetSlotIndex];
      if (slotAttachments) {
        Object.keys(slotAttachments).forEach((attachmentName) => {
          attachments.push(attachmentName);
        });
      }
    }
    return attachments;
  }, []);

  const findBlushSlots = useCallback((skeleton: any) => {
    if (!skeleton || !skeleton.slots) return [];
    const blushSlotNames = [
      "11111",
      "cheek",
      "blush",
      "face",
      "saihong",
      "yanhong",
    ];
    const foundSlots: string[] = [];
    skeleton.slots.forEach((slot: any) => {
      const slotName = slot.data.name.toLowerCase();
      if (
        blushSlotNames.some((name) => slotName.includes(name.toLowerCase()))
      ) {
        foundSlots.push(slot.data.name);
      }
    });
    return foundSlots;
  }, []);

  const checkAnimationColorTracks = useCallback((skeletonData: any) => {
    if (!skeletonData || !skeletonData.animations) return [];
    const colorAnimations: string[] = [];
    skeletonData.animations.forEach((anim: any) => {
      if (!anim.timelines) return;
      let hasColorTracks = false;
      anim.timelines.forEach((timeline: any) => {
        if (timeline.slotIndex !== undefined) hasColorTracks = true;
      });
      if (hasColorTracks) colorAnimations.push(anim.name);
    });
    return colorAnimations;
  }, []);

  // ========== UPDATED EXPRESSION SYSTEM ==========

  const applyExpression = useCallback((expressionName: string) => {
    const skeleton = skeletonRef.current;
    const skeletonData = skeletonDataRef.current;
    if (!skeleton || !skeletonData) return;

    console.log(`Applying expression: ${expressionName}`);

    const cheekSlotNames = [
      "11111",
      "cheek",
      "blush",
      "face",
      "saihong",
      "yanhong",
    ];
    let applied = false;

    for (const slotName of cheekSlotNames) {
      const slot = skeleton.findSlot(slotName);
      if (!slot) continue;

      let attachment: any = null;

      if (expressionName === "normal") {
        attachment = skeletonData.defaultSkin?.getAttachment(
          slot.data.index,
          slotName,
        );
      } else {
        // Try default skin first
        attachment = skeletonData.defaultSkin?.getAttachment(
          slot.data.index,
          expressionName,
        );
        // If not found, check all other skins
        if (!attachment && skeletonData.skins) {
          for (const skin of skeletonData.skins) {
            attachment = skin.getAttachment(slot.data.index, expressionName);
            if (attachment) {
              console.log(
                `Found expression "${expressionName}" in skin: ${skin.name}`,
              );
              break;
            }
          }
        }
      }

      if (attachment) {
        slot.setAttachment(attachment);
        console.log(`Set expression "${expressionName}" on slot: ${slotName}`);
        applied = true;
      }
    }

    if (applied) {
      skeleton.updateWorldTransform();
      setCurrentExpression(expressionName);
      currentExpressionRef.current = expressionName;

      const blushSlots = cheekSlotNames.filter((name) =>
        skeleton.findSlot(name),
      );
      setDebugInfo((prev) => ({
        ...prev,
        blushSlots,
        expression: expressionName,
        currentSkin: skeleton.skin?.name || "default",
      }));

      // IMPORTANT: Keep the current animation playing!
      if (stateRef.current) {
        // If we're switching from an expression to normal, make sure animation is playing
        if (expressionName === "normal") {
          // Already playing the current animation, no need to change
          console.log(
            `Keeping animation "${currentAnimationRef.current}" playing`,
          );
        } else {
          // When applying an expression, make sure "normal" animation is playing
          if (currentAnimationRef.current !== "normal") {
            stateRef.current.setAnimation(0, "normal", true);
            setCurrentAnimation("normal");
            console.log(`Switched to "normal" animation for expression`);
          }
        }
      }
    } else {
      console.warn(`No attachment found for expression "${expressionName}"`);
    }
  }, []);

  const applyAnimation = useCallback(
    (animName: string) => {
      if (!stateRef.current || !skeletonRef.current || !skeletonDataRef.current)
        return;

      console.log(`Applying animation: ${animName}`);

      // Check if this is an expression or an animation
      const isExpression = expressionSkins.includes(animName);

      if (isExpression) {
        // Apply expression but keep "normal" animation playing
        applyExpression(animName);
        setCurrentAnimation("normal");
        currentAnimationRef.current = "normal";
      } else {
        // Apply regular animation and reset to default expression
        stateRef.current.setAnimation(0, animName, true);
        setCurrentAnimation(animName);
        currentAnimationRef.current = animName;

        // Reset to default expression
        applyExpression("normal");
      }

      skeletonRef.current.setSkin(skeletonDataRef.current.defaultSkin);
      skeletonRef.current.setSlotsToSetupPose();
      skeletonRef.current.updateWorldTransform();
    },
    [expressionSkins, applyExpression],
  );

  // ========== CYCLE EXPRESSIONS ==========

  const cycleExpression = useCallback(() => {
    if (!expressionSkins.length) return;
    const currentIndex = expressionSkins.indexOf(currentExpression);
    const nextIndex = (currentIndex + 1) % expressionSkins.length;
    applyExpression(expressionSkins[nextIndex]);
  }, [currentExpression, expressionSkins, applyExpression]);

  // ========== RENDERING HOOK ==========

  const startCustomRendering = useCallback(
    (width: number, height: number) => {
      if (!glRef.current || !skeletonRef.current || !spineRef.current) return;

      const gl = glRef.current;
      const spine = spineRef.current;

      // Stop any existing render loop
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      let shader;
      try {
        if (spine.webgl.Shader && spine.webgl.Shader.newTwoColoredTextured) {
          shader = spine.webgl.Shader.newTwoColoredTextured(gl);
        } else if (
          spine.webgl.Shader &&
          spine.webgl.Shader.newColoredTextured
        ) {
          shader = spine.webgl.Shader.newColoredTextured(gl);
        } else {
          shader = spine.webgl.Shader.newColored(gl);
        }
      } catch (e) {
        shader = spine.webgl.Shader.newColored(gl);
      }

      const batcher = new spine.webgl.PolygonBatcher(gl);
      const skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
      skeletonRenderer.premultipliedAlpha = true;
      if (skeletonRenderer.twoColorTint !== undefined) {
        skeletonRenderer.twoColorTint = true;
      }

      let lastTime = performance.now();
      let frameCount = 0;
      let lastFpsUpdate = performance.now();

      const render = (time: number) => {
        animationFrameIdRef.current = requestAnimationFrame(render);
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        frameCount++;

        // Update animation state only if playing
        if (isPlaying && stateRef.current) {
          stateRef.current.update(delta);
          stateRef.current.apply(skeletonRef.current);
          skeletonRef.current.updateWorldTransform();
        }

        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        try {
          const shaderProgram = shader._program || shader.program;
          gl.useProgram(shaderProgram);
          const projection = new spine.webgl.Matrix4();
          projection.ortho2d(0, 0, width, height);
          const projTransLoc = gl.getUniformLocation(
            shaderProgram,
            "u_projTrans",
          );
          if (projTransLoc)
            gl.uniformMatrix4fv(projTransLoc, false, projection.values);
          const textureLoc = gl.getUniformLocation(shaderProgram, "u_texture");
          if (textureLoc) gl.uniform1i(textureLoc, 0);
          batcher.begin(shader);
          skeletonRenderer.draw(batcher, skeletonRef.current);
          batcher.end();
        } catch (err) {
          console.error("Rendering error:", err);
        }

        if (time - lastFpsUpdate > 1000) {
          const fps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
          setDebugInfo((prev) => ({ ...prev, fps }));
          frameCount = 0;
          lastFpsUpdate = time;
        }
      };

      animationFrameIdRef.current = requestAnimationFrame(render);
    },
    [isPlaying],
  );

  // ========== POSITIONING ==========

  const calculatePosition = useCallback(
    (bounds: any, offset: any, width: number, height: number) => {
      const scaleX = (width * 1.5) / Math.max(Math.abs(bounds.x), 1);
      const scaleY = (height * 1.5) / Math.max(Math.abs(bounds.y), 1);
      const scale = Math.min(scaleX, scaleY);

      const centerX = offset.x + bounds.x / 1.6;
      const centerY = offset.y + bounds.y / 4;

      let x = width / 2 - centerX * scale;
      let y = height / 2 - centerY * scale;

      return { x, y, scale };
    },
    [],
  );

  // ========== SETUP SPINE ==========

  const setupSpine = useCallback(
    (
      gl: WebGLRenderingContext,
      skeletonData: any,
      width: number,
      height: number,
    ) => {
      try {
        if (initializedRef.current) return; // Guard against multiple setups

        const spine = spineRef.current;
        console.log("Setting up Spine...");

        skeletonDataRef.current = skeletonData;
        const allSkins = findAllSkins(skeletonData);

        // Dynamically find expression skins
        const expressions = findExpressionSkins(skeletonData);
        setExpressionSkins(
          expressions.length ? ["normal", ...expressions] : ["normal"],
        );

        const attachments = debugAllAttachments(skeletonData);

        setAvailableSkins(allSkins);
        const animNames =
          skeletonData.animations?.map((a: any) => a.name) || [];
        setAnimations(animNames);
        const colorAnimations = checkAnimationColorTracks(skeletonData);

        const skeleton = new spine.Skeleton(skeletonData);
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        skeletonRef.current = skeleton;
        const blushSlots = findBlushSlots(skeleton);

        const bounds = new spine.Vector2();
        const offset = new spine.Vector2();
        skeleton.getBounds(offset, bounds, []);

        // Calculate position and scale
        const positionData = calculatePosition(bounds, offset, width, height);

        skeleton.x = positionData.x;
        skeleton.y = positionData.y;
        skeleton.scaleX = positionData.scale;
        skeleton.scaleY = positionData.scale;

        skeleton.userData = skeleton.userData || {};
        skeleton.userData.originalScale = positionData.scale;
        skeleton.userData.originalX = skeleton.x;
        skeleton.userData.originalY = skeleton.y;

        const animationStateData = new spine.AnimationStateData(skeletonData);
        const state = new spine.AnimationState(animationStateData);
        stateRef.current = state;

        // Initialize with the default animation
        state.setAnimation(0, animationName, true);
        setCurrentAnimation(animationName);
        currentAnimationRef.current = animationName;
        applyExpression("normal");

        setDebugInfo((prev) => ({
          ...prev,
          fps: 0,
          width,
          height,
          scale: positionData.scale,
          blushSlots,
          colorAnimations,
          availableAttachments: attachments,
          hasVertexColors: blushSlots.length > 0,
          currentSkin: skeleton.skin?.name || "default",
        }));

        setIsInitialized(true);
        initializedRef.current = true;
        startCustomRendering(width, height);

        console.log("Spine setup complete");
      } catch (err: any) {
        console.error("Spine setup error:", err);
        setError(`Setup failed: ${err.message}`);
      }
    },
    [
      findAllSkins,
      findExpressionSkins,
      debugAllAttachments,
      checkAnimationColorTracks,
      findBlushSlots,
      applyExpression,
      animationName,
      startCustomRendering,
      calculatePosition,
    ],
  );

  // ========== FIXED ASSET LOADING ==========

  const loadSpineAssets = useCallback(async (): Promise<{
    skeletonData: any;
  }> => {
    if (isLoadingAssets) {
      console.log("Assets already loading, skipping...");
      throw new Error("Assets already loading");
    }

    setIsLoadingAssets(true);
    setLoadProgress({ atlas: 10, skeleton: 10, textures: 10 });

    return new Promise((resolve, reject) => {
      try {
        console.log("Starting Spine asset loading...");
        const spine = spineRef.current;
        const gl = glRef.current;

        if (!gl || !spine) {
          reject(new Error("WebGL or Spine runtime not available"));
          return;
        }

        const assetManager = new spine.webgl.AssetManager(gl);
        const atlasUrl = `${spinePath}${atlasFile}`;
        const skelUrl = `${spinePath}${skeletonFile}`;

        console.log(`Loading assets from ${spinePath}:`, {
          atlasFile,
          skeletonFile,
        });

        // Load assets
        assetManager.loadTextureAtlas(atlasUrl);
        assetManager.loadBinary(skelUrl);

        let checkCount = 0;
        const maxChecks = 100; // 10 seconds max
        const checkInterval = 100; // Check every 100ms

        const checkAssets = () => {
          checkCount++;

          if (checkCount > maxChecks) {
            setIsLoadingAssets(false);
            reject(new Error("Asset loading timeout"));
            return;
          }

          if (assetManager.isLoadingComplete()) {
            if (assetManager.hasErrors()) {
              const errors = assetManager.getErrors();
              console.error("AssetManager errors:", errors);
              setIsLoadingAssets(false);
              reject(
                new Error(`Failed to load assets: ${JSON.stringify(errors)}`),
              );
              return;
            }

            setLoadProgress({ atlas: 100, skeleton: 100, textures: 100 });

            try {
              const atlas = assetManager.get(atlasUrl);
              const skeletonBinary = assetManager.get(skelUrl);

              if (!atlas || !skeletonBinary) {
                throw new Error("Failed to get loaded assets");
              }

              const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
              const skeletonBinaryLoader = new spine.SkeletonBinary(
                atlasLoader,
              );
              skeletonBinaryLoader.scale = 1;
              const skeletonData =
                skeletonBinaryLoader.readSkeletonData(skeletonBinary);

              if (!skeletonData) {
                throw new Error("Failed to parse skeleton data");
              }

              console.log("Spine assets loaded successfully");
              setIsLoadingAssets(false);
              resolve({ skeletonData });
            } catch (err: any) {
              console.error("Error processing assets:", err);
              setIsLoadingAssets(false);
              reject(err);
            }
          } else {
            // Simplified progress update - just increment gradually
            const baseProgress = Math.min(90, checkCount * 2);

            setLoadProgress({
              atlas: Math.min(baseProgress + 10, 95),
              skeleton: Math.min(baseProgress + 10, 95),
              textures: Math.min(baseProgress + 10, 95),
            });

            setTimeout(checkAssets, checkInterval);
          }
        };

        // Start checking
        setTimeout(checkAssets, checkInterval);
      } catch (err: any) {
        console.error("Failed to load Spine assets:", err);
        setIsLoadingAssets(false);
        reject(err);
      }
    });
  }, [spinePath, atlasFile, skeletonFile, isLoadingAssets]);

  // ========== INITIALIZATION ==========

  useEffect(() => {
    console.log(
      "Initialization effect running, initializedRef:",
      initializedRef.current,
    );

    if (initializedRef.current) {
      console.log("Already initialized, skipping...");
      return;
    }

    const init = async () => {
      try {
        console.log("Starting initialization...");

        const spine = (window as any).spine;
        if (!spine) {
          console.log("Spine runtime not available yet");
          // Try again in 500ms
          setTimeout(() => {
            if (!initializedRef.current && initAttemptRef.current < 3) {
              initAttemptRef.current++;
              init();
            }
          }, 500);
          return;
        }

        spineRef.current = spine;
        console.log("Spine runtime loaded");

        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) {
          setError("Container or canvas not found");
          return;
        }

        const rect = container.getBoundingClientRect();
        const width = Math.max(100, Math.floor(rect.width));
        const height = Math.max(100, Math.floor(rect.height));

        console.log(`Canvas dimensions: ${width}x${height}`);

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const gl = canvas.getContext("webgl", {
          alpha: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,
          antialias: true,
          stencil: true,
        }) as WebGLRenderingContext;

        if (!gl) {
          setError("WebGL not supported");
          return;
        }

        glRef.current = gl;
        console.log("WebGL context created");

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.STENCIL_TEST);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        console.log("Loading assets...");
        const assets = await loadSpineAssets();
        console.log("Assets loaded, setting up Spine...");

        setupSpine(gl, assets.skeletonData, width, height);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(`Initialization failed: ${err.message}`);
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      init();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);

      console.log("Cleanup: stopping animation frame");
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = 0;
      }

      // Clean up WebGL context
      if (glRef.current) {
        const gl = glRef.current;
        const loseContext = gl.getExtension("WEBGL_lose_context");
        if (loseContext) {
          loseContext.loseContext();
        }
      }

      // Reset initialization state
      initializedRef.current = false;
      setIsInitialized(false);
    };
  }, []); // Empty dependency array - only run once on mount

  // ========== CONTROL FUNCTIONS ==========

  const changeAnimation = useCallback(
    (animName: string) => {
      applyAnimation(animName);
    },
    [applyAnimation],
  );

  const togglePlayPause = useCallback(() => setIsPlaying((prev) => !prev), []);
  const resetToPose = useCallback(() => {
    if (skeletonRef.current) {
      skeletonRef.current.setToSetupPose();
      skeletonRef.current.updateWorldTransform();
      const userData = skeletonRef.current.userData;
      if (userData?.originalScale && userData.originalX && userData.originalY) {
        skeletonRef.current.scaleX = userData.originalScale;
        skeletonRef.current.scaleY = userData.originalScale;
        skeletonRef.current.x = userData.originalX;
        skeletonRef.current.y = userData.originalY;
      }
    }
  }, []);

  // ========== RENDER ==========

  if (error) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#1a1a1a",
          color: "#ff6b6b",
          padding: "30px",
          borderRadius: "8px",
          textAlign: "center",
          border: "2px solid #ff6b6b",
        }}
      >
        <div
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}
        >
          ⚠️ Error
        </div>
        <div
          style={{ fontSize: "14px", marginBottom: "20px", maxWidth: "500px" }}
        >
          {error}
        </div>
        <button
          onClick={() => {
            initializedRef.current = false;
            setIsInitialized(false);
            setError(null);
            initAttemptRef.current = 0;
          }}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "12px 28px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const isLoading = isLoadingAssets || !isInitialized;
  const totalProgress =
    loadProgress.atlas * 0.4 +
    loadProgress.skeleton * 0.4 +
    loadProgress.textures * 0.2;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "500px",
        backgroundColor: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#4CAF50",
            fontFamily: "monospace",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #333",
              borderTop: "4px solid #4CAF50",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          />
          <div
            style={{
              fontSize: "16px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            {isLoadingAssets ? "Loading Spine Assets..." : "Initializing..."}
          </div>
          <div style={{ width: "300px", marginBottom: "15px" }}>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#333",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${totalProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #2196F3, #4CAF50)",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64B5F6",
                marginTop: "5px",
                textAlign: "center",
              }}
            >
              {Math.round(totalProgress)}% Complete
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#aaa", marginTop: "15px" }}>
            Loading: {skeletonFile}
          </div>
        </div>
      )}

      {showControls && isInitialized && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)",
            padding: "15px",
            pointerEvents: "none",
            borderTop: "1px solid rgba(76, 175, 80, 0.3)",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              background: "rgba(0,0,0,0.7)",
              padding: "10px 15px",
              borderRadius: "6px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                color: "#4CAF50",
                fontFamily: "monospace",
                fontSize: "11px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "rgba(76, 175, 80, 0.2)",
                  color: "#4CAF50",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #4CAF5040",
                }}
              >
                FPS: {debugInfo.fps}
              </span>
              <span
                style={{
                  background: "rgba(33, 150, 243, 0.2)",
                  color: "#2196F3",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #2196F340",
                }}
              >
                Scale: {debugInfo.scale.toFixed(2)}x
              </span>
              <span
                style={{
                  background:
                    debugInfo.blushSlots.length > 0
                      ? "rgba(255, 138, 128, 0.2)"
                      : "rgba(158, 158, 158, 0.2)",
                  color:
                    debugInfo.blushSlots.length > 0 ? "#FF8A80" : "#9E9E9E",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${
                    debugInfo.blushSlots.length > 0 ? "#FF8A8040" : "#9E9E9E40"
                  }`,
                }}
              >
                Blush: {debugInfo.blushSlots.length}
              </span>
              <span
                style={{
                  background: "#FF9800",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #FF9800",
                }}
              >
                Spine 3.8
              </span>
            </div>
            <div
              style={{
                color: "#fff",
                fontFamily: "monospace",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span>
                Animation: <strong>{currentAnimation}</strong>
              </span>
              {currentExpression !== "normal" && (
                <span style={{ marginLeft: "15px", color: "#FF8A80" }}>
                  Expression: <strong>{currentExpression}</strong>
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              pointerEvents: "auto",
              background: "rgba(0,0,0,0.8)",
              borderRadius: "8px",
              padding: "15px",
              border: "1px solid rgba(255,255,255,0.1)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  color: "#4CAF50",
                  fontSize: "13px",
                  marginBottom: "8px",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  borderBottom: "1px solid rgba(76, 175, 80, 0.3)",
                  paddingBottom: "5px",
                }}
              >
                Animations ({animations.length})
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "8px",
                  marginBottom: "5px",
                }}
              >
                {animations
                  .filter((anim) => !expressionSkins.includes(anim))
                  .map((anim) => (
                    <button
                      key={anim}
                      onClick={() => changeAnimation(anim)}
                      style={{
                        background:
                          anim === currentAnimation
                            ? "#4CAF50"
                            : "rgba(255,255,255,0.1)",
                        color: "white",
                        border: "none",
                        padding: "8px 4px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                      title={anim}
                    >
                      {anim}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector("style[data-spine-viewer]")) {
  styleSheet.setAttribute("data-spine-viewer", "true");
  document.head.appendChild(styleSheet);
}

export default SpineViewer;
