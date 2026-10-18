// Original EducationOS adapter. The vendored Anatomy source is MIT licensed.
// Run from the project root: node scripts/build-cube-scenes.mjs
import { writeFile } from "node:fs/promises";
import * as kit from "../src/vendor/anatomy/iso-kit.mjs";
import { turning } from "../src/vendor/anatomy/turn-build.mjs";
import * as audit from "../src/vendor/anatomy/audit.mjs";
import * as turnAudit from "../src/vendor/anatomy/turn-audit.mjs";

const scale = 32;
const scenes = {};
const reports = {};
const orbitReports = {};
for (const preset of ["2x2x2", "3x2x2", "3x3x2", "3x3x3"]) {
  const [length, width, height] = preset.split("x").map(Number);
  // Fit the entire swept cylinder, not only the initial cuboid silhouette.
  const radius = Math.hypot(length / 2, width / 2) * scale;
  const center = [length * scale / 2, width * scale / 2];
  const fitPoints = [];
  for (let angle = 0; angle < 360; angle += 15) {
    for (const z of [0, height * scale]) fitPoints.push([center[0] + radius * Math.cos(angle * Math.PI / 180), center[1] + radius * Math.sin(angle * Math.PI / 180), z]);
  }
  const P = kit.fitProjection(fitPoints, 560, 360, { pad: 32, azimuth: 45, elevation: 30 });
  const recorder = audit.recorder(P, { ground: (shape) => shape.name?.endsWith("-0") ?? false });
  const T = turning(P, { recorder });
  const subject = T.group("box", { turn: { pivot: center } });
  const layer = T.layer("cubes");
  T.stack(["cubes"]);
  const partLayers = [];
  for (let z = 0; z < height; z++) for (let y = 0; y < width; y++) for (let x = 0; x < length; x++) {
    T.prism({ name: `cube-${x}-${y}-${z}`, group: subject, layer, plan: { x: x * scale, y: y * scale, w: scale, d: scale, r: 0 }, z: z * scale, h: scale, bevel: 0 });
    partLayers.push(z);
  }
  const out = T.build({ poses: Array.from({ length: 73 }, (_, index) => ({ box: index * 5 })), strict: true });
  scenes[preset] = { data: out.data, svg: out.layerSvg("cubes", { width: 560, height: 360 }), partLayers };
  reports[preset] = out.report;
  if (process.argv.includes("--orbit")) {
    const result = turnAudit.orbit(T, recorder, P, { sweep: { at: (yaw) => ({ box: yaw }), from: 0, to: 360, frame: .3 }, log: (check) => console.log(`${preset}: ${check}`) });
    orbitReports[preset] = { failures: turnAudit.orbitFailures(result), stats: result.stats, notes: result.notes, skipped: result.skipped, quick: result.quick, problems: Object.fromEntries(Object.entries(result).filter(([key, value]) => Array.isArray(value) && value.length && !["notes", "skipped"].includes(key))) };
    await writeFile(new URL("../docs/anatomy/cube-orbit-evidence.json", import.meta.url), JSON.stringify({ source: "Anatomy e9488296a44211c42701ff71705b7901470ec78f", kind: "Full non-quick Anatomy orbit suite; yaw sweep every 0.3 degrees plus default random/event and continuity checks. Layer isolation is a display filter of these same rigid parts.", reports: orbitReports }, null, 2) + "\n");
  }
}
await writeFile(new URL("../src/components/portal/labs/cube-scenes.json", import.meta.url), JSON.stringify(scenes));
// Include only the scoped rules used by these untextured cube primitives.
await writeFile(new URL("../src/components/portal/labs/cube-runtime.css", import.meta.url), `.cube-stage .iso-live{--tn-0:var(--anatomy-shade-0);--tn-1:var(--anatomy-shade-1);--tn-2:var(--anatomy-shade-2);--tn-3:var(--anatomy-shade-3);--tn-4:var(--anatomy-top)}\n.cube-stage .iso-tn{stroke-width:.4;stroke-linejoin:round;--ta:var(--tn-0);--tb:var(--tn-1);fill:color-mix(in srgb,var(--ta) calc(100% - var(--f,0) * 100%),var(--tb));stroke:color-mix(in srgb,var(--ta) calc(100% - var(--f,0) * 100%),var(--tb))}\n${[1, 2, 3].map((i) => `.cube-stage .iso-tn[data-b="${i}"]{--ta:var(--tn-${i});--tb:var(--tn-${i + 1})}`).join("\n")}\n.cube-stage .iso-line{fill:none;stroke:var(--anatomy-hi);stroke-linejoin:round;stroke-linecap:round;stroke-width:1}\n.cube-stage .iso-fill{fill:var(--anatomy-shade-0)}\n.cube-stage .iso-top{fill:var(--anatomy-top)}\n.cube-stage .iso-shade[data-shade="0"]{fill:var(--anatomy-shade-0)}\n.cube-stage .iso-shade[data-shade="1"]{fill:var(--anatomy-shade-1)}\n.cube-stage .iso-shade[data-shade="2"]{fill:var(--anatomy-shade-2)}\n.cube-stage .iso-shade[data-shade="3"]{fill:var(--anatomy-shade-3)}\n`);
await writeFile(new URL("../docs/anatomy/cube-build-evidence.json", import.meta.url), JSON.stringify({ source: "Anatomy e9488296a44211c42701ff71705b7901470ec78f", units: "1 semantic cm = 32 drawing units", check: "Strict build; 73 yaw poses at 5-degree increments. Separating-plane proofs only; not the complete upstream orbit/fidelity audit.", reports }, null, 2) + "\n");
console.log(JSON.stringify({ bytes: Buffer.byteLength(JSON.stringify(scenes)), parts: Object.fromEntries(Object.entries(scenes).map(([key, value]) => [key, value.data.parts.length])) }));
