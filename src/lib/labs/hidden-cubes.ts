import type { LabCheck, LabRecord } from "./types";

export const CUBE_PRESETS = ["2x2x2", "3x2x2", "3x3x2", "3x3x3"] as const;
export type CubePreset = typeof CUBE_PRESETS[number];
export type CubeDimensions = { length: number; width: number; height: number };
export type UnitCube = { id: string; x: number; y: number; z: number };
export const CUBE_DRAWING_UNITS_PER_CM = 32;
export function cubePreset(value?: string): CubePreset {
  return CUBE_PRESETS.includes(value as CubePreset) ? value as CubePreset : "3x2x2";
}
export function cubeDimensions(preset: CubePreset): CubeDimensions {
  const [length, width, height] = preset.split("x").map(Number);
  return { length, width, height };
}
export function cubeQuantities({ length, width, height }: CubeDimensions) {
  return { perLayer: length * width, layers: height, volume: length * width * height };
}
export function unitCubes(dimensions: CubeDimensions): UnitCube[] {
  const cubes: UnitCube[] = [];
  for (let z = 0; z < dimensions.height; z++) {
    for (let y = 0; y < dimensions.width; y++) {
      for (let x = 0; x < dimensions.length; x++) cubes.push({ id: `cube-${x}-${y}-${z}`, x, y, z });
    }
  }
  return cubes;
}
export function normalizedYaw(value: number): number {
  return ((value % 360) + 360) % 360;
}
export function rotateCubePoint(point: readonly [number, number, number], dimensions: CubeDimensions, yaw: number): [number, number, number] {
  const angle = normalizedYaw(yaw) * Math.PI / 180;
  const x = point[0] - dimensions.length / 2;
  const y = point[1] - dimensions.width / 2;
  return [dimensions.length / 2 + x * Math.cos(angle) - y * Math.sin(angle), dimensions.width / 2 + x * Math.sin(angle) + y * Math.cos(angle), point[2]];
}
export function cubesInLayer(dimensions: CubeDimensions, layer: number | null): UnitCube[] {
  return unitCubes(dimensions).filter((cube) => layer === null || cube.z === layer);
}
export function cubeLayerReadout(dimensions: CubeDimensions, layer: number | null): string {
  const { perLayer, layers, volume } = cubeQuantities(dimensions);
  return layer === null ? `Showing all ${layers} layers: ${volume} cubes. Complete object: ${volume} cubic centimetres.` : `Showing layer ${layer + 1} of ${layers}: ${perLayer} cubes shown; complete object: ${volume} cubes.`;
}
export function isCubePrediction(value?: string): boolean {
  return value !== undefined && /^\d{1,3}$/.test(value.trim());
}
const matches = (value: string | undefined, expected: number) => isCubePrediction(value) && Number(value) === expected;
export function assessHiddenCubes(record: LabRecord): LabCheck {
  const answers = record.answers;
  const { perLayer, layers, volume } = cubeQuantities(cubeDimensions(cubePreset(record.settings.preset)));
  if (!isCubePrediction(answers.prediction) || answers.revealed !== "yes") return { passed: false, feedback: "Make a prediction, then open the builder. Your first guess may change." };
  if (!matches(answers.perLayer, perLayer)) return { passed: false, feedback: "A face is a surface of a cube. Count the rows in one complete layer: length × width." };
  if (!matches(answers.layers, layers)) return { passed: false, feedback: "Each layer is one centimetre high. Count all the equal layers, including the ones hidden by this view." };
  if (!matches(answers.volume, volume)) return { passed: false, feedback: "Side lengths describe edges. For the space inside, multiply cubes in one layer by the number of layers." };
  if (answers.unit !== "cm3") return { passed: false, feedback: "These are one-centimetre cubes with length, width and height. Choose cubic centimetres." };
  if (answers.reason !== "equal-layers") return { passed: false, feedback: "Turning changes what you can see. It does not create or remove cubes. Explain the complete object using equal layers." };
  if (!matches(answers.transferLayer, 8) || !matches(answers.transferLayers, 3) || !matches(answers.transfer, 24)) return { passed: false, feedback: "Try the new 4 × 2 × 3 box. Each layer has 2 rows of 4 cubes; there are 3 equal layers." };
  return { passed: true, feedback: "Recorded! You counted complete layers and used cubic centimetres, even when some cubes were hidden." };
}
