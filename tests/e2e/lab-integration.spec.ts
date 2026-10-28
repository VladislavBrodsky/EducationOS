import { test, expect } from "@playwright/test";
import { blankDemoSession, DEMO_STORAGE_KEY } from "../../src/lib/demo-state";

test("new lab routes use the clean app host while the public home stays separate", async ({ request }) => {
  for (const [path, title] of [["/labs", "See an idea from a new side"], ["/labs/loop-loom", "Loop Loom"], ["/labs/same-half", "Same Half Different Shape"], ["/labs/hidden-cubes", "Hidden Cube Builder"]]) {
    const response = await request.get(path, { headers: { Host: "app.educationos.space" } });
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    const html = await response.text();
    expect(html).toContain(title);
    expect(html).toContain('href="/labs');
    expect(html).not.toContain('href="/portal/labs');
  }
  const marketing = await request.get("/", { headers: { Host: "educationos.space" } });
  expect(await marketing.text()).toContain("m-hero-copy");
  expect(await marketing.text()).not.toContain("DISCOVERY LAB / 01");
});

test("lab drafts join the notebook export and confirmed clear without erasing legacy demo work", async ({ page }) => {
  await page.goto("/portal/labs/loop-loom");
  await page.getByLabel("My predicted number of lines", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Save my prediction", exact: true }).click();
  await page.getByLabel("Keep a question or explain your idea. (Optional)", { exact: true }).fill("I will try a larger loop.");
  const demo = blankDemoSession();
  demo.drafts["10-12"].notice = "A separate Inventors Lab observation.";
  const savedDemo = JSON.stringify(demo);
  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, value), { key: DEMO_STORAGE_KEY, value: savedDemo });
  await page.getByRole("link", { name: "Open my notebook", exact: true }).click();
  await expect(page.locator(".p-progress-summary strong")).toHaveText("0 / 18");
  const entry = page.locator(".p-notebook-entry").filter({ has: page.getByRole("heading", { name: "Loop Loom", exact: true }) });
  await expect(entry).toContainText("First prediction5");
  await expect(entry).toContainText("I will try a larger loop.");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my work", exact: true }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Export stream unavailable");
  let body = "";
  for await (const chunk of stream) body += chunk.toString();
  const exported = JSON.parse(body);
  expect(exported.labs["loop-loom"]).toMatchObject({ answers: { prediction: "5", predictionSubmitted: "yes" }, reflection: "I will try a larger loop.", completed: false });
  await page.getByRole("button", { name: "Clear portal work", exact: true }).click();
  await page.getByRole("button", { name: "Keep my work", exact: true }).click();
  await expect(entry).toBeVisible();
  await page.getByRole("button", { name: "Clear portal work", exact: true }).click();
  await page.getByRole("button", { name: "Clear all portal work", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A blank page is a good beginning", exact: true })).toBeVisible();
  expect(await page.evaluate(key => sessionStorage.getItem(key), DEMO_STORAGE_KEY)).toBe(savedDemo);
});

test("the cube paper lesson works without JavaScript and keeps its answer closed initially", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/portal/labs/hidden-cubes`);
    await expect(page.getByRole("heading", { name: "Count with layers on paper", exact: true })).toBeVisible();
    const example = page.locator("noscript details");
    await expect(example).not.toHaveAttribute("open");
    await page.getByText("Show a worked layer example", { exact: true }).click();
    await expect(example).toHaveAttribute("open", "");
    await expect(example).toContainText("6 × 2 = 12 cubic centimetres");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally { await context.close(); }
});
