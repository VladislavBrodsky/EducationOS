import { test, expect } from "@playwright/test";

test("Today resumes an unfinished mobile discovery lab with its saved prediction", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portal/labs/loop-loom");
  await page.getByLabel("My predicted number of lines", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Save my prediction", exact: true }).click();
  await page.goto("/portal");
  const resume = page.getByRole("region", { name: "Continue your work", exact: true });
  await expect(resume).toBeVisible();
  await expect(resume.getByRole("link", { name: "Loop Loom", exact: true })).toHaveAttribute("href", "/portal/labs/loop-loom");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await resume.getByRole("link", { name: "Loop Loom", exact: true }).click();
  await expect(page.getByLabel("My predicted number of lines", { exact: true })).toHaveValue("5");
});

test("Today offers edited lessons and removes them from unfinished work once recorded", async ({ page }) => {
  await page.goto("/portal");
  await expect(page.getByRole("region", { name: "Continue your work", exact: true })).toHaveCount(0);
  await page.goto("/portal/learn/programming-first-message");
  await page.getByLabel("Your code", { exact: true }).fill('print("My draft")');
  await page.goto("/portal");
  const resume = page.getByRole("region", { name: "Continue your work", exact: true });
  await expect(resume.getByRole("link", { name: "Your first message", exact: true })).toBeVisible();
  await resume.getByRole("link", { name: "Your first message", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).fill('print("Hello, world!")\nprint("I can make things.")');
  await page.getByRole("button", { name: "Check & record activity", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "activity recorded" })).toBeVisible();
  await page.goto("/portal");
  await expect(resume).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Start learning", exact: true })).toHaveAttribute("href", "/portal/learn/programming-variables");
});

test("a fully recorded subject offers a revisit and announces subject changes", async ({ page }) => {
  for (const [id, answer] of [["mathematics-patterns", "15"], ["mathematics-fractions", "1/2"], ["mathematics-area", "12 square units"]]) {
    await page.goto(`/portal/learn/${id}`);
    await page.getByRole("radio", { name: answer, exact: true }).check();
    await page.getByRole("button", { name: "Check my answer", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "activity recorded" })).toBeVisible();
  }
  await page.goto("/portal");
  await page.getByRole("button", { name: /^Mathematics\b/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Mathematics selected." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Revisit activity", exact: true })).toHaveAttribute("href", "/portal/learn/mathematics-area");
  await expect(page.getByText("All 3 activities in this path recorded", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue learning", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue your work", exact: true })).toHaveCount(0);
});
