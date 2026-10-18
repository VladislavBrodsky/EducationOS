"use client";

import { useEffect, useRef, useState } from "react";
import type { CubePreset } from "@/lib/labs/hidden-cubes";
import type { TurnController } from "@/vendor/anatomy/turn.mjs";
import scenes from "./cube-scenes.json";
import "./cube-runtime.css";

type Props = { preset: CubePreset; yaw: number; layer: number | null; onYaw: (yaw: number) => void; onUnavailable: () => void };
export default function CubeScene({ preset, yaw, layer, onYaw, onUnavailable }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const controller = useRef<TurnController | null>(null);
  const latest = useRef({ yaw, layer });
  const drag = useRef<{ pointer: number; x: number; yaw: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const fixture = scenes[preset];
  useEffect(() => {
    latest.current = { yaw, layer };
    controller.current?.set({ box: yaw });
    stage.current?.querySelectorAll<SVGGElement>("g[data-p]").forEach((node) => {
      const index = Number(node.dataset.p);
      node.style.display = layer === null || fixture.partLayers[index] === layer ? "" : "none";
    });
  }, [yaw, layer, fixture]);
  useEffect(() => {
    let disposed = false;
    let mounted: TurnController | null = null;
    const element = stage.current;
    if (!element) return;
    import("@/vendor/anatomy/turn.mjs").then(({ TURN }) => {
      if (disposed) return;
      mounted = TURN.mount(element, fixture.data);
      controller.current = mounted;
      mounted.set({ box: latest.current.yaw });
      element.querySelectorAll<SVGGElement>("g[data-p]").forEach((node) => {
        node.style.display = latest.current.layer === null || fixture.partLayers[Number(node.dataset.p)] === latest.current.layer ? "" : "none";
      });
      setLoaded(true);
    }).catch(() => { if (!disposed) onUnavailable(); });
    // There is no idle animation or tour: only a direct input renders a frame.
    // Stop any active pointer gesture when the activity is hidden/offscreen.
    const stop = () => { drag.current = null; };
    const visibility = () => { if (document.hidden) stop(); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    observer?.observe(element);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      stop();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      mounted?.destroy();
      controller.current = null;
    };
  }, [fixture, onUnavailable]);
  return <>
    <div ref={stage} className="cube-stage iso-turn" aria-hidden="true" data-testid="cube-3d-stage" data-ready={loaded ? "yes" : "loading"}
      onPointerDown={(event) => { if (!loaded) return; drag.current = { pointer: event.pointerId, x: event.clientX, yaw }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => { if (drag.current?.pointer === event.pointerId) onYaw(drag.current.yaw + (event.clientX - drag.current.x) * .6); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      // This markup is a checked-in fixture generated only by the pinned build
      // script. No learner text, network markup, or executable SVG is included.
      dangerouslySetInnerHTML={{ __html: fixture.svg }} />
    <p className="cube-caption">{loaded ? "Drag sideways to turn, or use the buttons and slider below. Each outlined block is a one-centimetre cube." : "Loading the optional turning view. The layer view remains available."}</p>
  </>;
}
