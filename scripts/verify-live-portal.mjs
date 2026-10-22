import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { Resolver } from "node:dns/promises";
import { isIP } from "node:net";
import path from "node:path";

// This exercises only browser-tab drafts. It does not create accounts or call a write API.
const origin = new URL(process.env.EDUCATIONOS_VERIFY_ORIGIN || "https://app.educationos.space");
if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
  throw new Error("EDUCATIONOS_VERIFY_ORIGIN must be a credential-free HTTPS origin.");
}
const base = (process.env.EDUCATIONOS_VERIFY_BASE || "").replace(/\/$/, "");
if (base !== "" && base !== "/portal") throw new Error("EDUCATIONOS_VERIFY_BASE must be empty or /portal.");
const output = path.resolve(process.env.EDUCATIONOS_VERIFY_OUTPUT || "artifacts/live-portal");
const widths = (process.env.EDUCATIONOS_VERIFY_WIDTHS || "390,430").split(",").map(Number);
if (widths.length === 0 || widths.some((width) => ![390, 430].includes(width))) throw new Error("EDUCATIONOS_VERIFY_WIDTHS must contain 390, 430, or both.");
await mkdir(output, { recursive: true });
expect.configure({ timeout: 15000 });
const check = expect.configure({ timeout: 15000 });
const report = {
  origin: origin.origin,
  base,
  startedAt: new Date().toISOString(),
  scope: "Chromium mobile viewport/touch emulation; not a physical iOS or Android device. Default HTTPS certificate verification is enabled. Each class starts in a fresh browser context. Synthetic answers are stored only in sessionStorage.",
  checks: [],
};
const browserArgs = [];
if (process.env.EDUCATIONOS_VERIFY_DNS_SERVER) {
  const server = process.env.EDUCATIONOS_VERIFY_DNS_SERVER;
  if (!isIP(server)) throw new Error("EDUCATIONOS_VERIFY_DNS_SERVER must be an explicit public DNS server IP.");
  const resolver = new Resolver({ timeout: 5000, tries: 2 });
  resolver.setServers([server]);
  const addresses = await resolver.resolve4(origin.hostname);
  const selected = addresses.find((address) => isIP(address) === 4);
  if (!selected) throw new Error("The selected DNS server returned no IPv4 address for the portal hostname.");
  const rule = `MAP ${origin.hostname} ${selected}`;
  browserArgs.push(`--host-resolver-rules=${rule}`);
  report.testNetwork = { dnsServer: server, hostname: origin.hostname, resolvedAt: new Date().toISOString(), publicAnswers: addresses, selectedAddress: selected, chromiumHostResolverRule: rule, appliesTo: "This Chromium process and the portal hostname only. No system DNS or hosts-file changes.", httpsCertificateValidation: "Default validation against the actual HTTPS hostname remains enabled." };
  report.scope += ` For this run, Chromium selects the portal IP returned by DNS server ${server} using a process-only host-resolver rule. HTTPS still uses and validates ${origin.hostname}. See testNetwork for the exact public answers and rule.`;
}
const urlFor = (pathname) => new URL(`${base}${pathname}`, origin).href;
const safeUrl = (raw) => { try { const u = new URL(raw); return `${u.origin}${u.pathname}`; } catch { return raw; } };
const browser = await chromium.launch({ headless: true, args: browserArgs });

async function task(name, run) {
  const result = { name, status: "running", startedAt: new Date().toISOString() };
  report.checks.push(result);
  try { await run(result); result.status = "passed"; }
  catch (error) { result.status = "failed"; result.error = error instanceof Error ? error.message : String(error); }
  result.finishedAt = new Date().toISOString();
  console.log(`${result.status.toUpperCase()}: ${name}`);
}

async function bounds(page) {
  check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "No page-level horizontal overflow").toBe(true);
}
async function scan(page, result, name) {
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  result.accessibility ||= [];
  result.accessibility.push({ name, violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length, targets: nodes.map((n) => n.target) })) });
  check(axe.violations, `${name}: axe WCAG A/AA checks`).toEqual([]);
}
async function screenshot(page, result, name) {
  const file = `${name}.png`;
  await page.screenshot({ path: path.join(output, file), fullPage: true });
  (result.screenshots ||= []).push(file);
}
async function mobileLab(id, viewport, run) {
  await task(`${id} ${viewport.width}x${viewport.height}`, async (result) => {
    result.viewport = viewport;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    const pageErrors = [], failedRequests = [], canceledFetches = [], badAssets = [], writes = [];
    result.pageErrors = pageErrors; result.failedRequests = failedRequests; result.canceledFetches = canceledFetches; result.badAssets = badAssets; result.remoteWrites = writes;
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      const failure = { url: safeUrl(request.url()), type: request.resourceType(), error: request.failure()?.errorText };
      const headers = request.headers();
      // Next cancels speculative route fetches as links leave the viewport or a reload starts.
      // Keep those cancellations in the evidence, while real document/chunk/asset failures still fail.
      if (failure.error === "net::ERR_ABORTED" && failure.type === "fetch" && (headers.rsc === "1" || headers["next-router-prefetch"] === "1")) {
        canceledFetches.push({ ...failure, rsc: headers.rsc, prefetch: headers["next-router-prefetch"] });
      } else failedRequests.push(failure);
    });
    page.on("response", (response) => { if (response.status() >= 400 && ["document", "script", "stylesheet", "image", "font"].includes(response.request().resourceType())) badAssets.push({ url: safeUrl(response.url()), type: response.request().resourceType(), status: response.status() }); });
    page.on("request", (request) => { if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) writes.push({ method: request.method(), url: safeUrl(request.url()) }); });
    try {
      // Explicitly deny canvas to demonstrate that every core task has a complete fallback.
      await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
      const response = await page.goto(urlFor(`/labs/${id}`), { waitUntil: "networkidle", timeout: 45000 });
      check(response?.status()).toBe(200);
      check(new URL(page.url()).origin).toBe(origin.origin);
      check(new URL(page.url()).protocol).toBe("https:");
      check(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
      await run(page, result);
      await bounds(page);
      await scan(page, result, "light");
      await screenshot(page, result, `${id}-${viewport.width}-light`);
      await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
      await scan(page, result, "dark");
      await bounds(page);
      await screenshot(page, result, `${id}-${viewport.width}-dark`);
      check(pageErrors, "Uncaught browser errors").toEqual([]);
      check(badAssets, "Failed document or asset responses").toEqual([]);
      check(failedRequests, "Failed requests").toEqual([]);
      check(writes, "No remote writes from local learning tasks").toEqual([]);
    } catch (error) {
      await screenshot(page, result, `${id}-${viewport.width}-failure`).catch(() => {});
      throw error;
    } finally { await context.close(); }
  });
}

async function loom(page) {
  await check(page.getByRole("heading", { name: "Loop Loom", exact: true })).toBeVisible();
  await check(page.getByText("Your output is hidden.", { exact: true })).toBeVisible();
  await check(page.getByRole("button", { name: "Step", exact: true })).toBeDisabled();
  await page.getByLabel("My predicted number of lines", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Save my prediction", exact: true }).click();
  await check(page.getByRole("button", { name: "Run", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "2D view", exact: true }).click();
  await check(page.getByRole("heading", { name: "Flat instruction trace", exact: true })).toBeVisible();
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Step", exact: true }).click();
  await check(page.locator(".loom-output")).toHaveText("Clap\nTap\nClap\nTap\nClap\nTap");
  await page.getByLabel("With 3 repeats and two instructions per block, how many lines print?", { exact: true }).fill("6");
  await page.getByLabel("How many lines will this new program print?", { exact: true }).fill("4");
  await page.getByLabel("What are the first three output lines, in order?", { exact: true }).selectOption("Clap, Tap, Snap");
  await page.getByRole("button", { name: "Check & record my learning", exact: true }).click();
  await check(page.locator(".loom-explain .p-assessment-feedback")).toContainText("Keep investigating.");
  await page.getByLabel("How many lines will this new program print?", { exact: true }).fill("12");
  await page.getByRole("button", { name: "Check & record my learning", exact: true }).click();
  await check(page.locator(".loom-explain .p-assessment-feedback")).toContainText("Learning recorded.");
  await page.reload({ waitUntil: "networkidle" });
  await check(page.locator(".p-heading .p-tag")).toHaveText("Activity recorded");
  await check(page.getByLabel("My predicted number of lines", { exact: true })).toHaveValue("3");
  await check(page.getByLabel("How many lines will this new program print?", { exact: true })).toHaveValue("12");
  await page.getByRole("button", { name: "2D view", exact: true }).click();
}

async function half(page) {
  await check(page.getByRole("heading", { name: "Same Half Different Shape", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "The amount changes with the shape.", exact: true }).check();
  await page.getByRole("button", { name: "Try my prediction", exact: true }).click();
  await check(page.getByRole("heading", { name: "Make a half with your own shape.", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Rearrange six cells", exact: true }).click();
  await check(page.locator(".half-count")).toContainText("6 of 12 equal cells selected.");
  const cell = page.getByRole("button", { name: "Cell 1, row 1, column 1", exact: true });
  await cell.tap();
  await check(page.locator(".half-count")).toContainText("5 of 12 equal cells selected.");
  await cell.tap();
  await page.getByRole("button", { name: "Try a tilted view", exact: true }).click();
  await check(page.getByRole("img", { name: "A tilted picture of your twelve-cell whole" })).toBeVisible();
  await page.getByRole("radio", { name: "Both cover half of the same-sized whole.", exact: true }).check();
  await page.getByRole("radio", { name: "No. Those two pieces together cover less than half.", exact: true }).check();
  await page.getByRole("spinbutton", { name: "How many of eight equal cells make half?", exact: true }).fill("3");
  await page.getByRole("radio", { name: "I can split the eight equal cells into two groups with the same number.", exact: true }).check();
  await page.getByRole("button", { name: "Check and record my discovery", exact: true }).click();
  await check(page.locator(".p-assessment-feedback")).toContainText("Keep investigating.");
  await page.getByRole("spinbutton", { name: "How many of eight equal cells make half?", exact: true }).fill("4");
  await page.getByRole("button", { name: "Check and record my discovery", exact: true }).click();
  await check(page.locator(".p-assessment-feedback")).toContainText("Discovery recorded.");
  await page.reload({ waitUntil: "networkidle" });
  await check(page.locator(".p-heading .p-tag")).toHaveText("Activity recorded");
  await check(page.getByRole("spinbutton", { name: "How many of eight equal cells make half?", exact: true })).toHaveValue("4");
}

async function cubeAnswers(page, l, w, h) {
  for (const [label, answer] of [["Cubes in one layer", l * w], ["Number of equal layers", h], ["Volume of the complete box", l * w * h], ["New box: cubes per layer", 8], ["New box: number of layers", 3], ["New box: volume in cm³", 24]]) await page.getByLabel(label, { exact: true }).fill(String(answer));
  await page.getByLabel("Unit for the volume", { exact: true }).selectOption("cm3");
  await page.getByLabel("Why does turning the box keep its volume?", { exact: true }).selectOption("equal-layers");
}
async function cubes(page, result) {
  await check(page.getByRole("heading", { name: "Hidden Cube Builder", exact: true })).toBeVisible();
  await check(page.locator(".cube-readout")).toHaveCount(0);
  result.cubePresets = [];
  for (const preset of ["3x2x2", "2x2x2", "3x3x2", "3x3x3"]) {
    const [l, w, h] = preset.split("x").map(Number);
    await page.getByLabel("Choose a box: length × width × height").selectOption(preset);
    await check(page.locator(".cube-readout")).toHaveCount(0);
    await page.getByLabel("My prediction: how many one-centimetre cubes fill this box?", { exact: true }).fill("7");
    await page.getByRole("button", { name: "Open the builder", exact: true }).click();
    await check(page.getByRole("button", { name: "2D layers", exact: true })).toHaveAttribute("aria-pressed", "true");
    await check(page.locator(".cube-cell")).toHaveCount(l * w * h);
    await check(page.locator(".cube-readout")).toContainText(`${l * w * h} cubic centimetres`);
    await page.getByRole("button", { name: "Turn in 3D", exact: true }).click();
    const stage = page.getByTestId("cube-3d-stage");
    await check(stage).toHaveAttribute("data-ready", "yes");
    await check(stage.locator("g[data-p]")).toHaveCount(l * w * h);
    const shape = stage.locator('g[data-p="0"] path').first();
    const before = await shape.getAttribute("d");
    await page.getByRole("button", { name: "Quarter turn", exact: true }).click();
    await check(shape).not.toHaveAttribute("d", before);
    for (let layer = 0; layer < h; layer++) {
      await page.getByLabel("Inspect a layer", { exact: true }).selectOption(String(layer));
      await check(stage.locator('g[data-p]:not([style*="display: none"])')).toHaveCount(l * w);
      await check(page.locator(".cube-readout")).toHaveText(`Showing layer ${layer + 1} of ${h}: ${l * w} cubes shown; complete object: ${l * w * h} cubes.`);
    }
    await page.getByRole("button", { name: "2D layers", exact: true }).click();
    await check(stage).toHaveCount(0);
    check(await page.evaluate(() => "__isoTurn" in window)).toBe(false);
    await page.getByLabel("Inspect a layer", { exact: true }).selectOption("all");
    await cubeAnswers(page, l, w, h);
    if (preset === "3x2x2") {
      await page.getByLabel("New box: volume in cm³", { exact: true }).fill("9");
      await page.getByRole("button", { name: "Check & record my discovery", exact: true }).click();
      await check(page.locator(".cube-feedback")).toContainText("new 4 × 2 × 3 box");
      await page.getByLabel("New box: volume in cm³", { exact: true }).fill("24");
    }
    await page.getByRole("button", { name: "Check & record my discovery", exact: true }).click();
    await check(page.locator(".cube-feedback")).toContainText("Recorded!");
    await bounds(page);
    result.cubePresets.push({ preset, cubes: l * w * h, layer: l * w, geometryReprojected: true, recorded: true });
  }
  await page.reload({ waitUntil: "networkidle" });
  await check(page.locator(".p-heading .p-tag")).toHaveText("Activity recorded");
  await check(page.getByLabel("Choose a box: length × width × height")).toHaveValue("3x3x3");
  await check(page.locator(".cube-cell")).toHaveCount(27);
}

try {
  await task("HTTPS portal routing", async (result) => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      result.routes = [];
      for (const id of ["loop-loom", "same-half", "hidden-cubes"]) {
        const response = await page.goto(urlFor(`/labs/${id}`), { waitUntil: "networkidle", timeout: 45000 });
        check(new URL(page.url()).origin).toBe(origin.origin);
        check(response.status()).toBe(200);
        check(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
        const html = await response.text();
        check(html).toContain('href="' + `${base}/labs`);
        if (!base) check(html).not.toContain('href="/portal/labs');
        result.routes.push({ path: `${base}/labs/${id}`, status: response.status(), noindex: response.headers()["x-robots-tag"] });
      }
      if (!base) {
        const response = await page.goto(new URL("/portal/labs/loop-loom", origin).href, { waitUntil: "networkidle", timeout: 45000 });
        check(new URL(page.url()).origin).toBe(origin.origin);
        check(new URL(page.url()).pathname).toBe("/labs/loop-loom");
        const chain = [];
        for (let request = response.request(); request; request = request.redirectedFrom()) {
          const step = await request.response();
          chain.unshift({ url: safeUrl(request.url()), status: step.status(), location: step.headers().location });
        }
        check(chain.some((step) => new URL(step.url).pathname === "/portal/labs/loop-loom" && [301, 302, 307, 308].includes(step.status)), "Real server redirect from the portal prefix").toBe(true);
        result.cleanRedirect = { finalUrl: safeUrl(page.url()), chain };
      }
    } finally { await context.close(); }
  });
  await task("Marketing site availability and separation", async (result) => {
    const context = await browser.newContext();
    try {
      const marketingOrigin = new URL(process.env.EDUCATIONOS_VERIFY_MARKETING_ORIGIN || "https://educationos.space");
      if (marketingOrigin.protocol !== "https:" || marketingOrigin.username || marketingOrigin.password) throw new Error("Marketing origin must use HTTPS without credentials.");
      const page = await context.newPage();
      const marketing = await page.goto(marketingOrigin.origin, { waitUntil: "networkidle", timeout: 12000 });
      check(marketing.status()).toBe(200);
      const publicHtml = await marketing.text();
      check(publicHtml).toContain("Big ideas");
      check(publicHtml).not.toContain("DISCOVERY LAB / 01");
      result.marketing = { origin: marketingOrigin.origin, status: marketing.status(), separate: true };
    } finally { await context.close(); }
  });
  for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }].filter((viewport) => widths.includes(viewport.width))) {
    await mobileLab("loop-loom", viewport, loom);
    await mobileLab("same-half", viewport, half);
    await mobileLab("hidden-cubes", viewport, cubes);
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.every((r) => r.status === "passed");
  report.portalPassed = report.checks.filter((r) => r.name !== "Marketing site availability and separation").every((r) => r.status === "passed");
  report.marketingPassed = report.checks.find((r) => r.name === "Marketing site availability and separation")?.status === "passed";
  await writeFile(path.join(output, "verification.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Evidence: ${path.join(output, "verification.json")}`);
  if (!report.passed) process.exitCode = 1;
}
