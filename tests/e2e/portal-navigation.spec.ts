import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("mobile navigation stays reachable during a long lab and marks its parent", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/portal/labs/loop-loom");
    const navigation = page.getByRole("navigation", { name: "Learner navigation", exact: true });
    await expect(navigation.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "page");
    await page.getByRole("navigation", { name: "Discovery lab steps", exact: true }).getByRole("link", { name: "New case", exact: true }).click();
    await expect(page.locator("#lab-transfer")).toBeFocused();
    await expect.poll(() => page.evaluate(() => {
      const heading = document.querySelector("#lab-transfer")!.getBoundingClientRect();
      const steps = document.querySelector(".lab-step-navigation")!.getBoundingClientRect();
      return heading.top >= steps.bottom;
    })).toBe(true);
    const hit = await navigation.getByRole("link", { name: "Today", exact: true }).evaluate(element => {
      const rect = element.getBoundingClientRect();
      const covering = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return { reachable: rect.bottom <= innerHeight && rect.top > innerHeight - 100 && element.contains(covering), coveringTag: covering?.tagName };
    });
    expect(hit.reachable, `Today remains visible and tappable at ${width}px; covering element: ${hit.coveringTag}`).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await navigation.getByRole("link", { name: "Today", exact: true }).click();
    await expect(page.getByRole("heading", { name: "What will you discover?", exact: true })).toBeVisible();
  }
});

test("gated lab shortcuts open after a prediction, move focus and keep answers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const lab of ["same-half", "hidden-cubes"]) {
    await page.goto(`/portal/labs/${lab}`);
    const steps = page.getByRole("navigation", { name: "Discovery lab steps", exact: true });
    await expect(steps.getByRole("link")).toHaveCount(1);
    await expect(steps.getByText("Save your prediction to open the next steps.", { exact: true })).toBeVisible();
    if (lab === "same-half") {
      await page.getByRole("radio", { name: "I am not sure yet.", exact: true }).check();
      await page.getByRole("button", { name: "Try my prediction", exact: true }).click();
    } else {
      await page.getByLabel("My prediction: how many one-centimetre cubes fill this box?", { exact: true }).fill("10");
      await page.getByRole("button", { name: "Open the builder", exact: true }).click();
    }
    await expect(steps.getByRole("link")).toHaveCount(4);
    await steps.getByRole("link", { name: "New case", exact: true }).click();
    await expect(page.locator("#lab-transfer")).toBeFocused();
    const field = lab === "same-half" ? page.getByLabel("How many of eight equal cells make half?", { exact: true }) : page.getByLabel("New box: cubes per layer", { exact: true });
    await field.fill(lab === "same-half" ? "4" : "8");
    await steps.getByRole("link", { name: "Explore", exact: true }).click();
    await expect(page.locator("#lab-explore")).toBeFocused();
    await expect(field).toHaveValue(lab === "same-half" ? "4" : "8");
    await steps.getByRole("link", { name: "Predict", exact: true }).click();
    await expect(page.locator("#lab-predict")).toBeFocused();
    if (lab === "hidden-cubes") {
      await page.getByLabel("Choose a box: length × width × height", { exact: true }).selectOption("2x2x2");
      await expect(steps.getByRole("link")).toHaveCount(1);
      await expect(page.locator("#lab-explore")).toHaveCount(0);
    }
  }
});

test("mobile navigation and step shortcuts pass light and dark accessibility scans", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portal/labs/loop-loom");
  await page.getByRole("navigation", { name: "Discovery lab steps", exact: true }).getByRole("link", { name: "Explain", exact: true }).click();
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") {
      await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
      await page.getByRole("navigation", { name: "Discovery lab steps", exact: true }).getByRole("link", { name: "Explain", exact: true }).click();
    }
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(scan.violations, theme).toEqual([]);
  }
});
