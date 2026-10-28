import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function submitLoomPrediction(page: Page, prediction = "3") {
  await page.getByLabel("My predicted number of lines", { exact: true }).fill(prediction);
  await page.getByRole("button", { name: "Save my prediction", exact: true }).click();
}

async function solveLoom(page: Page, repeats = 3) {
  await submitLoomPrediction(page);
  await page.getByLabel(`With ${repeats} ${repeats === 1 ? "repeat" : "repeats"} and two instructions per block, how many lines print?`, { exact: true }).fill(String(repeats * 2));
  await page.getByLabel("How many lines will this new program print?", { exact: true }).fill("12");
  await page.getByLabel("What are the first three output lines, in order?", { exact: true }).selectOption("Clap, Tap, Snap");
  await page.getByRole("button", { name: "Check & record my learning", exact: true }).click();
}

test("Loop Loom starts paused, protects prediction, traces one instruction per step and offers the same 2D task", async ({ page }) => {
  await page.goto("/portal/labs/loop-loom");
  await expect(page.getByRole("heading", { name: "Loop Loom", exact: true })).toBeVisible();
  await expect(page.getByText("Your output is hidden.", { exact: true })).toBeVisible();
  await expect(page.locator(".loom-ticket")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Step", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Run", exact: true })).toBeDisabled();
  await submitLoomPrediction(page, "3");
  await expect(page.locator(".loom-output")).toHaveText("(nothing printed yet)");
  await expect(page.locator(".loom-ticket")).toHaveCount(6);
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator(".loom-output")).toHaveText("Clap");
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator(".loom-output")).toHaveText("Clap\nTap");
  await expect(page.locator(".loom-readout")).toContainText("1 complete block · 2 lines printed. Next: Clap.");
  await page.getByRole("button", { name: "2D view", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Flat instruction trace", exact: true })).toBeVisible();
  await expect(page.locator(".loom-flat-trace")).toContainText("1 of 3 blocks complete · 2 lines printed");
  await expect(page.locator(".loom-output")).toHaveText("Clap\nTap");
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator(".loom-output")).toHaveText("Clap\nTap\nClap");
  await page.getByRole("button", { name: "Isometric view", exact: true }).click();
  await expect(page.getByRole("img", { name: /^Loop Loom instruction machine/ })).toBeVisible();
});

test("Loop Loom run, pause and reset use one timer and navigation discards its controller", async ({ page }) => {
  await page.clock.install();
  await page.goto("/portal/labs/loop-loom");
  await submitLoomPrediction(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.clock.runFor(1400);
  await expect(page.locator(".loom-output")).toHaveText("Clap\nTap");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(3500);
  await expect(page.locator(".loom-output")).toHaveText("Clap\nTap");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.clock.runFor(700);
  await expect(page.locator(".loom-output")).toHaveText("Clap\nTap\nClap");
  await page.getByRole("button", { name: "Reset run", exact: true }).click();
  await page.clock.runFor(2100);
  await expect(page.locator(".loom-output")).toHaveText("(nothing printed yet)");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.getByRole("link", { name: "All discovery labs", exact: true }).click();
  await page.clock.runFor(2100);
  await page.getByRole("link", { name: "Loop Loom", exact: true }).click();
  await expect(page.locator(".loom-output")).toHaveText("(nothing printed yet)");
  await page.clock.runFor(2100);
  await expect(page.locator(".loom-output")).toHaveText("(nothing printed yet)");
});

test("Loop Loom changes repeat counts at zero and six, clearing revealed and saved answers", async ({ page }) => {
  await page.goto("/portal/labs/loop-loom");
  await submitLoomPrediction(page);
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await page.getByLabel("Repeats", { exact: true }).fill("0");
  await expect(page.getByLabel("My predicted number of lines", { exact: true })).toHaveValue("");
  await expect(page.getByText("Your output is hidden.", { exact: true })).toBeVisible();
  await submitLoomPrediction(page, "0");
  await expect(page.locator(".loom-output")).toHaveText("(empty output)");
  await expect(page.locator(".loom-readout")).toHaveText("Zero repeats runs neither instruction.");
  await expect(page.getByRole("button", { name: "Step", exact: true })).toBeDisabled();
  await page.getByLabel("Repeats", { exact: true }).fill("6");
  await submitLoomPrediction(page, "12");
  for (let step = 0; step < 12; step += 1) await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator(".loom-output")).toHaveText(Array.from({ length: 6 }, () => "Clap\nTap").join("\n"));
  await expect(page.locator(".loom-ticket.is-printed")).toHaveCount(12);
  await expect(page.getByRole("button", { name: "Step", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "One more repeat", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Reset run", exact: true }).click();
  await expect(page.getByLabel("Repeats", { exact: true })).toHaveValue("6");
  await expect(page.locator(".loom-output")).toHaveText("(nothing printed yet)");
  await page.reload();
  await expect(page.getByLabel("Repeats", { exact: true })).toHaveValue("6");
  await expect(page.getByLabel("My predicted number of lines", { exact: true })).toHaveValue("12");
  await expect(page.locator(".loom-output")).toHaveText("(nothing printed yet)");
});

test("Loop Loom checks new-case understanding, restores recorded work and invalidates edited answers", async ({ page }) => {
  await page.goto("/portal/labs/loop-loom");
  await submitLoomPrediction(page, "3");
  await page.getByLabel("With 3 repeats and two instructions per block, how many lines print?", { exact: true }).fill("6");
  await page.getByLabel("How many lines will this new program print?", { exact: true }).fill("4");
  await page.getByLabel("What are the first three output lines, in order?", { exact: true }).selectOption("Clap, Tap, Snap");
  await page.getByRole("button", { name: "Check & record my learning", exact: true }).click();
  await expect(page.locator(".loom-explain .p-assessment-feedback")).toContainText("count Clap, Tap, and Snap");
  await page.getByLabel("How many lines will this new program print?", { exact: true }).fill("12");
  await page.getByRole("button", { name: "Check & record my learning", exact: true }).click();
  await expect(page.locator(".loom-explain .p-assessment-feedback")).toContainText("learning recorded");
  await page.getByLabel("Keep a question or explain your idea. (Optional)", { exact: true }).fill("A loop repeats the whole group in order.");
  await page.reload();
  await expect(page.getByLabel("My predicted number of lines", { exact: true })).toHaveValue("3");
  await expect(page.getByLabel("How many lines will this new program print?", { exact: true })).toHaveValue("12");
  await expect(page.locator(".p-heading .p-tag")).toHaveText("Activity recorded");
  await page.getByRole("link", { name: "Open my notebook", exact: true }).click();
  const entry = page.locator(".p-notebook-entry").filter({ has: page.getByRole("heading", { name: "Loop Loom", exact: true }) });
  await expect(entry).toContainText("Activity recorded");
  await expect(entry).toContainText("A loop repeats the whole group in order.");
  await page.goto("/portal/labs/loop-loom");
  await page.getByLabel("How many lines will this new program print?", { exact: true }).fill("4");
  await expect(page.locator(".p-heading .p-tag")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".p-heading .p-tag")).toHaveCount(0);
});

test("Loop Loom mobile and reduced-motion 2D mode work without WebGL and pass contrast checks in both themes", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/portal/labs/loop-loom");
  await submitLoomPrediction(page);
  await expect(page.getByRole("button", { name: "Run", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "2D view", exact: true }).click();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.locator(".loom-output")).toHaveText("Clap");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  let scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations, "mobile light Loop Loom").toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations, "mobile dark Loop Loom").toEqual([]);
  await solveLoom(page);
  await expect(page.locator(".loom-explain .p-assessment-feedback")).toContainText("learning recorded");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("Loop Loom has a native worked example when JavaScript is unavailable", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/portal/labs/loop-loom");
  await expect(page.getByRole("heading", { name: "Loop Loom without animation", exact: true })).toBeVisible();
  const example = page.getByText("Reveal the worked example", { exact: true });
  await expect(page.getByRole("table", { name: "Three blocks, with two lines in each block", exact: true })).not.toBeVisible();
  await example.click();
  await expect(page.getByRole("table", { name: "Three blocks, with two lines in each block", exact: true })).toBeVisible();
  await context.close();
});
