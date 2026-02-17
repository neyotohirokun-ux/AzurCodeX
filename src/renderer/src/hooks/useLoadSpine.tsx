import { useEffect } from "react";

export default function useLoadSpine(onLoaded?: () => void) {
  useEffect(() => {
    if ((window as any).spine) {
      onLoaded?.();
      return;
    }

    const scripts = [
      "script/spine3.8/spine-core.js",
      "script/spine3.8/spine-webgl.js",
    ];

    let loaded = 0;

    scripts.forEach((src) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => {
        loaded++;
        if (loaded === scripts.length) {
          console.log("Spine 3.8 loaded");
          onLoaded?.();
        }
      };
      document.body.appendChild(s);
    });
  }, []);
}
