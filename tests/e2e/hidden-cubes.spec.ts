import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function predict(page: import("@playwright/test").Page, value = "7") {
  await page.getByLabel("My prediction: how many one-centimetre cubes fill this box?", { exact: true }).fill(value);
  await page.getByRole("button", { name: "Open the builder", exact: true }).click();
}
async function explain(page: import("@playwright/test").Page, length: number, width: number, height: number) {
  await page.getByLabel("Cubes in one layer", { exact: true }).fill(String(length * width));
  await page.getByLabel("Number of equal layers", { exact: true }).fill(String(height));
  await page.getByLabel("Volume of the complete box", { exact: true }).fill(String(length * width * height));
  await page.getByLabel("Unit for the volume", { exact: true }).selectOption("cm3");
  await page.getByLabel("Why does turning the box keep its volume?", { exact: true }).selectOption("equal-layers");
  await page.getByLabel("New box: cubes per layer", { exact: true }).fill("8");
  await page.getByLabel("New box: number of layers", { exact: true }).fill("3");
  await page.getByLabel("New box: volume in cm³", { exact: true }).fill("24");
}
test("cube predictions gate the readouts and checks derive from every preset plus a fresh transfer case", async ({ page }) => {
  await page.goto("/portal/labs/hidden-cubes");
  await expect(page.getByRole("heading", { name: "Hidden Cube Builder", exact: true })).toBeVisible();
  await expect(page.locator(".cube-readout")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open the builder", exact: true })).toBeEnabled();
  for (const preset of ["3x2x2", "2x2x2", "3x3x2", "3x3x3"]) {
    const [length, width, height] = preset.split("x").map(Number);
    await page.getByLabel("Choose a box: length × width × height").selectOption(preset);
    await expect(page.locator(".cube-readout")).toHaveCount(0);
    await predict(page);
    await expect(page.locator(".cube-readout")).toContainText(`${length * width * height} cubic centimetres`);
    await explain(page, length, width, height);
    if (preset === "3x2x2") {
      await page.getByLabel("Unit for the volume", { exact: true }).selectOption("cm2");
      await page.getByRole("button", { name: "Check & record my discovery" }).click();
      await expect(page.locator(".cube-feedback")).toContainText("Choose cubic centimetres");
      await page.getByLabel("Unit for the volume", { exact: true }).selectOption("cm3");
      await page.getByLabel("New box: volume in cm³", { exact: true }).fill("9");
      await page.getByRole("button", { name: "Check & record my discovery" }).click();
      await expect(page.locator(".cube-feedback")).toContainText("new 4 × 2 × 3 box");
      await page.getByLabel("New box: volume in cm³", { exact: true }).fill("24");
    }
    await page.getByRole("button", { name: "Check & record my discovery" }).click();
    await expect(page.locator(".cube-feedback")).toContainText("Recorded!");
    await expect(page.locator(".p-heading")).toContainText("Activity recorded");
  }
  await page.reload();
  await expect(page.locator(".cube-feedback")).toContainText("discovery recorded");
  await expect(page.getByLabel("Choose a box: length × width × height")).toHaveValue("3x3x3");
});

test("the actual Anatomy runtime reprojects cubes, isolates all layers and cleans up on representation changes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/portal/labs/hidden-cubes");
  for (const preset of ["2x2x2", "3x2x2", "3x3x2", "3x3x3"]) {
    const [length, width, height] = preset.split("x").map(Number);
    await page.getByLabel("Choose a box: length × width × height").selectOption(preset);
    await predict(page);
    await page.getByRole("button", { name: "Turn in 3D", exact: true }).click();
    const stage = page.getByTestId("cube-3d-stage");
    await expect(stage).toHaveAttribute("data-ready", "yes");
    await expect(stage.locator("g[data-p]")).toHaveCount(length * width * height);
    const startingPath = await stage.locator('g[data-p="0"] path').first().getAttribute("d");
    for (const label of ["Quarter turn", "Half turn", "Three-quarter turn"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(page.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".cube-readout")).toContainText(`${length * width * height} cubic centimetres`);
    }
    expect(await stage.locator('g[data-p="0"] path').first().getAttribute("d")).not.toBe(startingPath);
    for (let layer = 0; layer < height; layer++) {
      await page.getByLabel("Inspect a layer", { exact: true }).selectOption(String(layer));
      await expect(stage.locator('g[data-p]:not([style*="display: none"])')).toHaveCount(length * width);
      await expect(page.locator(".cube-readout")).toHaveText(`Showing layer ${layer + 1} of ${height}: ${length * width} cubes shown; complete object: ${length * width * height} cubes.`);
    }
    await page.getByLabel("Inspect a layer", { exact: true }).selectOption("all");
    await page.getByRole("button", { name: "Reset view", exact: true }).click();
    await expect(page.getByRole("slider", { name: "Turn the box:" })).toHaveValue("0");
    await page.getByRole("button", { name: "15° right", exact: true }).click();
    await expect(page.getByRole("slider", { name: "Turn the box:" })).toHaveValue("15");
    await page.getByRole("slider", { name: "Turn the box:" }).press("ArrowRight");
    await expect(page.getByRole("slider", { name: "Turn the box:" })).toHaveValue("16");
    await page.getByRole("button", { name: "2D layers", exact: true }).click();
    await expect(stage).toHaveCount(0);
    expect(await page.evaluate(() => "__isoTurn" in window)).toBe(false);
  }
  expect(errors).toEqual([]);
});

test("mobile layer fallback works without a canvas, respects reduced motion and has accessible controls in both themes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext; });
  await page.goto("/portal/labs/hidden-cubes");
  await predict(page, "12");
  await expect(page.getByRole("button", { name: "2D layers", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".cube-cell")).toHaveCount(12);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  const layerScan = await new AxeBuilder({ page }).include(".lab-workspace").analyze();
  expect(layerScan.violations).toEqual([]);
  await page.getByRole("button", { name: "Turn in 3D", exact: true }).click();
  await expect(page.getByTestId("cube-3d-stage")).toHaveAttribute("data-ready", "yes");
  const turnScan = await new AxeBuilder({ page }).include(".lab-workspace").analyze();
  expect(turnScan.violations).toEqual([]);
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/hidden-cubes-mobile-dark.png", fullPage: true });
});

test("an optional turning-runtime failure returns to the complete layer activity", async ({ page }) => {
  await page.goto("/portal/labs/hidden-cubes");
  await predict(page);
  let blocked = false;
  await page.route("**/_next/static/chunks/**", async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes("__isoTurn")) { blocked = true; await route.abort(); }
    else await route.fulfill({ response });
  });
  await page.getByRole("button", { name: "Turn in 3D", exact: true }).click();
  await expect(page.getByText("The turning view could not load. All counting and questions work in the layer view.", { exact: true })).toBeVisible();
  expect(blocked).toBe(true);
  await expect(page.locator(".cube-cell")).toHaveCount(12);
  await explain(page, 3, 2, 2);
  await page.getByRole("button", { name: "Check & record my discovery" }).click();
  await expect(page.locator(".cube-feedback")).toContainText("Recorded!");
});
