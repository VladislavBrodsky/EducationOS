import { describe, expect, it } from "vitest";
import { CUBE_PRESETS, CUBE_DRAWING_UNITS_PER_CM, assessHiddenCubes, cubeDimensions, cubeLayerReadout, cubePreset, cubeQuantities, cubesInLayer, isCubePrediction, normalizedYaw, rotateCubePoint, unitCubes } from "../src/lib/labs/hidden-cubes";
import { blankLabRecord } from "../src/lib/labs/types";
import scenes from "../src/components/portal/labs/cube-scenes.json";

function solved(preset = "3x2x2") {
  const quantities = cubeQuantities(cubeDimensions(cubePreset(preset)));
  return { ...blankLabRecord(), settings: { preset }, answers: { prediction: "7", revealed: "yes", perLayer: String(quantities.perLayer), layers: String(quantities.layers), volume: String(quantities.volume), unit: "cm3", reason: "equal-layers", transfer: "24", transferLayer: "8", transferLayers: "3" } };
}
describe("Hidden Cube Builder mathematical model", () => {
  it("keeps dimensions and all cube counts deterministic for four finite presets", () => {
    expect(cubePreset()).toBe("3x2x2");
    expect(cubePreset("bad")).toBe("3x2x2");
    expect(CUBE_DRAWING_UNITS_PER_CM).toBe(32);
    for (const [index, preset] of CUBE_PRESETS.entries()) {
      const dimensions = cubeDimensions(preset);
      const cubes = unitCubes(dimensions);
      expect(cubes.length).toBe([8, 12, 18, 27][index]);
      expect(new Set(cubes.map((cube) => cube.id)).size).toBe(cubes.length);
      expect(cubeQuantities(dimensions).volume).toBe(cubes.length);
      expect(cubes.every(({ x, y, z }) => x >= 0 && x < dimensions.length && y >= 0 && y < dimensions.width && z >= 0 && z < dimensions.height)).toBe(true);
      expect(cubesInLayer(dimensions, null)).toHaveLength(cubes.length);
      for (let layer = 0; layer < dimensions.height; layer++) expect(cubesInLayer(dimensions, layer)).toHaveLength(dimensions.length * dimensions.width);
    }
  });
  it("rotates the true world coordinates around the center without changing heights, distances or counts", () => {
    for (const preset of CUBE_PRESETS) {
      const dimensions = cubeDimensions(preset);
      const center: [number, number, number] = [dimensions.length / 2, dimensions.width / 2, 0];
      for (const yaw of [0, .01, 44.99, 45, 45.01, 90, 135, 180, 225, 270, 315, 359.99, 360]) {
        const points = unitCubes(dimensions).map(({ x, y, z }) => rotateCubePoint([x + .5, y + .5, z + .5], dimensions, yaw));
        expect(points).toHaveLength(cubeQuantities(dimensions).volume);
        points.forEach((point, index) => {
          const cube = unitCubes(dimensions)[index];
          expect(Math.hypot(point[0] - center[0], point[1] - center[1])).toBeCloseTo(Math.hypot(cube.x + .5 - center[0], cube.y + .5 - center[1]));
          expect(point[2]).toBe(cube.z + .5);
        });
      }
    }
    expect(normalizedYaw(-15)).toBe(345);
    expect(normalizedYaw(375)).toBe(15);
  });
  it("derives the layer readout without subtracting hidden cubes from the complete volume", () => {
    expect(cubeLayerReadout(cubeDimensions("3x2x2"), 0)).toBe("Showing layer 1 of 2: 6 cubes shown; complete object: 12 cubes.");
    expect(cubeLayerReadout(cubeDimensions("3x3x3"), 2)).toContain("9 cubes shown; complete object: 27 cubes");
  });
  it("matches prebuilt Anatomy rigid parts and cm conversion to every mathematical fixture", () => {
    for (const preset of CUBE_PRESETS) {
      const dimensions = cubeDimensions(preset);
      const scene = scenes[preset];
      expect(scene.data.parts).toHaveLength(cubeQuantities(dimensions).volume);
      expect(scene.data.groups[0].pivot).toEqual([dimensions.length * 16, dimensions.width * 16]);
      expect(scene.partLayers).toEqual(unitCubes(dimensions).map((cube) => cube.z));
      scene.data.parts.forEach((part, index) => {
        const cube = unitCubes(dimensions)[index];
        expect(part.name).toBe(cube.id);
        expect(part.spec.z0).toBe(cube.z * 32);
        expect(part.spec.z1 - part.spec.z0).toBe(32);
      });
      expect(scene.svg).toContain('data-live="cubes"');
      expect(scene.svg).not.toMatch(/<script|onload=|href=/i);
    }
  });
});
describe("Hidden Cube Builder evidence check", () => {
  it("accepts a wrong first prediction followed by correct current and fresh-case reasoning", () => {
    for (const preset of CUBE_PRESETS) expect(assessHiddenCubes(solved(preset)).passed).toBe(true);
  });
  it("requires a submitted prediction, unit, layer reasoning and new-case answers", () => {
    expect(assessHiddenCubes(blankLabRecord()).passed).toBe(false);
    for (const key of ["prediction", "revealed", "perLayer", "layers", "volume", "unit", "reason", "transfer", "transferLayer", "transferLayers"]) {
      expect(assessHiddenCubes({ ...solved(), answers: { ...solved().answers, [key]: "" } }).passed).toBe(false);
    }
    expect(assessHiddenCubes({ ...solved(), answers: { ...solved().answers, unit: "cm2" } }).feedback).toContain("cubic centimetres");
    expect(assessHiddenCubes({ ...solved(), answers: { ...solved().answers, perLayer: "7" } }).feedback).toContain("complete layer");
  });
  it("accepts bounded whole-number predictions but rejects coercion and malformed observations", () => {
    for (const prediction of ["0", "12", "999", " 8 "]) expect(isCubePrediction(prediction)).toBe(true);
    for (const prediction of ["", "-1", "1.2", "Infinity", "2e1", "1000"]) expect(isCubePrediction(prediction)).toBe(false);
    expect(assessHiddenCubes({ ...solved(), answers: { ...solved().answers, volume: "1.2e1" } }).passed).toBe(false);
  });
});
