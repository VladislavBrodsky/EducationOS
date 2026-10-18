"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { boxCorners, depthOf, fitProjection, slabOf } from "@/vendor/anatomy/iso-kit";
import { DEFAULT_HALF_SELECTION, HALF_GRID, HALF_PATTERNS, readHalfSelection, toggleHalfCell, UNEQUAL_PARTS, unequalSelectedShare, writeHalfSelection } from "@/lib/labs/same-half";
import type { LabCheck, LabProps } from "@/lib/labs/types";
import { AnatomySolid } from "./anatomy-solid";
import "./same-half.css";

function TiltedTray({ selected }: { selected: readonly number[] }) {
  const size = 28;
  const tray = { x: -5, y: -5, w: HALF_GRID.columns * size + 10, d: HALF_GRID.rows * size + 10, r: 2 };
  const projection = fitProjection(boxCorners(tray, 0, 8), 480, 280, { pad: 24, azimuth: 45, elevation: 30 });
  const cells = Array.from({ length: HALF_GRID.cells }, (_, index) => ({
    index, x: (index % HALF_GRID.columns) * size, y: Math.floor(index / HALF_GRID.columns) * size,
  })).sort((a, b) => depthOf([a.x, a.y, 3], projection) - depthOf([b.x, b.y, 3], projection));
  return <figure className="half-tilted">
    <svg viewBox="0 0 480 280" role="img" aria-labelledby="half-tray-title half-tray-description">
      <title id="half-tray-title">A tilted picture of your twelve-cell whole</title>
      <desc id="half-tray-description">{selected.length} selected cells. This fixed isometric picture is made with Anatomy. Use the flat grid to compare area accurately.</desc>
      <AnatomySolid paths={slabOf(tray, 0, 3, projection)} />
      {cells.map(cell => <AnatomySolid key={cell.index} accent={selected.includes(cell.index)} paths={slabOf({ x: cell.x, y: cell.y, w: size, d: size, r: 0 }, 3, 4, projection)} />)}
    </svg>
    <figcaption>Fixed isometric view · Anatomy SVG. These are the same twelve cells. Use the flat view below to compare their areas.</figcaption>
  </figure>;
}

function FractionWhole({ parts, selected, label }: { parts: number; selected: number; label: string }) {
  return <figure className="half-whole">
    <div className="half-parts" style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }} role="img" aria-label={`${selected} of ${parts} equal parts are selected. This whole is the same size as the other comparison whole.`}>
      {Array.from({ length: parts }, (_, index) => <span key={index} className={index < selected ? "half-part is-selected" : "half-part"} aria-hidden="true">{index < selected ? <Check size={18} /> : null}</span>)}
    </div>
    <figcaption>{label}: <strong>{selected}/{parts}</strong></figcaption>
  </figure>;
}

export function SameHalf({ record, ready, onChange, onRecord }: LabProps) {
  const selected = readHalfSelection(record.settings.selection);
  const revealed = record.answers.revealed === "yes";
  const [tilted, setTilted] = useState(false);
  const [feedback, setFeedback] = useState<LabCheck | null>(null);
  const [selectionNotice, setSelectionNotice] = useState("");
  const unevenShare = unequalSelectedShare([0, 1]);

  function answer(key: string, value: string) {
    setFeedback(null);
    onChange({ answers: { ...record.answers, [key]: value } });
  }
  function changeSelection(cells: readonly number[], message = "") {
    setFeedback(null);
    setSelectionNotice(message);
    // Only the initial guess and its reveal survive a changed investigation.
    onChange({
      settings: { selection: writeHalfSelection(cells) },
      answers: {
        ...(record.answers.prediction ? { prediction: record.answers.prediction } : {}),
        ...(revealed ? { revealed: "yes" } : {}),
      },
    });
  }
  function rearrange() {
    const current = writeHalfSelection(selected);
    const index = HALF_PATTERNS.findIndex(pattern => writeHalfSelection(pattern) === current);
    const next = HALF_PATTERNS[(index + 1) % HALF_PATTERNS.length];
    changeSelection(next, "New shape, same six selected cells. Check your observations again.");
  }
  function reveal(event: FormEvent) {
    event.preventDefault();
    if (!record.answers.prediction) return;
    answer("revealed", "yes");
  }
  function recordPractice(event: FormEvent) {
    event.preventDefault();
    setFeedback(onRecord());
  }

  return <div className="half-lab">
    <section className="lab-panel half-predict" aria-labelledby="half-predict-heading">
      <p className="p-eyebrow">1 · Predict</p>
      <h2 id="half-predict-heading">Can different shapes cover the same amount?</h2>
      <p>Imagine six selected cells in a whole made of twelve equal cells. Move those six cells into a different pattern. Does the amount selected stay the same?</p>
      {!revealed ? <form onSubmit={reveal}>
        <fieldset className="half-choice-group"><legend>My prediction</legend>
          {[["same", "The amount stays the same."], ["different", "The amount changes with the shape."], ["unsure", "I am not sure yet."]].map(([value, label]) => <label key={value} className="p-choice"><input type="radio" name="half-prediction" value={value} checked={record.answers.prediction === value} onChange={() => answer("prediction", value)} disabled={!ready} /><span>{label}</span></label>)}
        </fieldset>
        <button className="p-primary" type="submit" disabled={!ready || !record.answers.prediction}>Try my prediction <ArrowRight size={17} aria-hidden="true" /></button>
      </form> : <div className="half-note"><strong>Prediction saved.</strong> A guess is a starting point. Use the cells to test it.</div>}
      <noscript><p>Draw a rectangle with three rows of four equal cells. Select six cells, then select a different set of six.</p><details><summary>Open the worked comparison</summary><p>Both patterns cover six of twelve equal cells: half. Three of six and two of four equal parts also cover half, when the whole is the same size. Two small pieces of an uneven four-piece whole need not be half. Four of eight equal cells make half because each of two equal groups has four cells.</p></details></noscript>
    </section>

    {revealed && <>
      <section className="lab-panel" aria-labelledby="half-make-heading">
        <p className="p-eyebrow">2 · Make and rearrange</p>
        <h2 id="half-make-heading">Make a half with your own shape.</h2>
        <p>Tap a cell to select it or clear it. The outside edge is one whole; every cell has the same area. Make a half, then try a new shape.</p>
        <div className="half-grid" role="group" aria-label="Twelve equal cells. Select cells to make half of the whole.">
          {Array.from({ length: HALF_GRID.cells }, (_, cell) => <button key={cell} className={`half-cell${selected.includes(cell) ? " is-selected" : ""}`} type="button" aria-label={`Cell ${cell + 1}, row ${Math.floor(cell / HALF_GRID.columns) + 1}, column ${cell % HALF_GRID.columns + 1}`} aria-pressed={selected.includes(cell)} disabled={!ready} onClick={() => changeSelection(toggleHalfCell(selected, cell))}><span aria-hidden="true">{cell + 1}</span>{selected.includes(cell) ? <Check size={18} aria-hidden="true" /> : <span className="half-cell-empty" aria-hidden="true" />}</button>)}
        </div>
        <p className="half-count" role="status"><strong>{selected.length} of {HALF_GRID.cells} equal cells selected.</strong> {selected.length === 6 ? "That is half: six selected and six left." : selected.length < 6 ? "Select more cells to make half." : "Clear some cells to make half."}</p>
        <div className="p-toolbar">
          <button type="button" className="p-secondary" onClick={rearrange} disabled={!ready}>Rearrange six cells <RotateCcw size={16} aria-hidden="true" /></button>
          <button type="button" className="p-secondary" onClick={() => changeSelection([], "All cells cleared. Try making a new half.")} disabled={!ready}>Clear cells</button>
          <button type="button" className="p-text-link" onClick={() => { setTilted(value => !value); }} aria-expanded={tilted} aria-controls="half-tilted-tray" disabled={!ready}>{tilted ? "Hide tilted view" : "Try a tilted view"}</button>
        </div>
        {selectionNotice && <p className="p-small p-muted" role="status">{selectionNotice}</p>}
        <div id="half-tilted-tray">{tilted && <TiltedTray selected={selected} />}</div>
        <details className="p-help"><summary>Why can the shape change?</summary><p>Each selected cell has the same area. Moving the selection changes where it is, but six equal cells still cover six of twelve. We compare area, not the outline of the pattern.</p></details>
      </section>

      <form onSubmit={recordPractice}>
        <section className="lab-panel" aria-labelledby="half-observe-heading">
          <p className="p-eyebrow">3 · Compare</p>
          <h2 id="half-observe-heading">Same whole, different equal parts.</h2>
          <p>Both rectangles below have exactly the same width and height. Their cells are equal within each rectangle.</p>
          <div className="half-comparison"><FractionWhole parts={6} selected={3} label="Three of six" /><FractionWhole parts={4} selected={2} label="Two of four" /></div>
          <fieldset className="half-choice-group"><legend>What do the selected areas show?</legend>
            <label className="p-choice"><input type="radio" name="half-observation" value="same-half" checked={record.answers.observation === "same-half"} onChange={() => answer("observation", "same-half")} disabled={!ready} /><span>Both cover half of the same-sized whole.</span></label>
            <label className="p-choice"><input type="radio" name="half-observation" value="different-amount" checked={record.answers.observation === "different-amount"} onChange={() => answer("observation", "different-amount")} disabled={!ready} /><span>Three selected parts must cover more than two.</span></label>
          </fieldset>
          <h3>A tricky whole: these parts are unequal.</h3>
          <div className="half-uneven" role="img" aria-label="One whole split into four unequal pieces. The first two small pieces are selected; together they cover two eighths of the whole.">{UNEQUAL_PARTS.map((width, index) => <span key={index} className={`half-part${index < 2 ? " is-selected" : ""}`} style={{ flex: width }} aria-hidden="true">{index < 2 ? <Check size={18} /> : null}</span>)}</div>
          <p>Two of four pieces are selected. Look at the space they cover before deciding.</p>
          <fieldset className="half-choice-group"><legend>Is this selected area half?</legend>
            <label className="p-choice"><input type="radio" name="half-unequal" value="not-half" checked={record.answers.unequal === "not-half"} onChange={() => answer("unequal", "not-half")} disabled={!ready} /><span>No. Those two pieces together cover less than half.</span></label>
            <label className="p-choice"><input type="radio" name="half-unequal" value="half" checked={record.answers.unequal === "half"} onChange={() => answer("unequal", "half")} disabled={!ready} /><span>Yes. Two pieces out of four always make half.</span></label>
          </fieldset>
          <details className="p-help"><summary>Show the unequal-parts explanation</summary><p>The small selected pieces cover {unevenShare.selectedArea}/{unevenShare.totalArea} of the whole. They cover a quarter, not a half. Counting selected parts out of all parts describes area only when the parts are equal.</p></details>
        </section>

        <section className="lab-panel" aria-labelledby="half-transfer-heading">
          <p className="p-eyebrow">4 · Try a new whole</p>
          <h2 id="half-transfer-heading">What if the whole has eight equal cells?</h2>
          <div className="half-transfer-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, cell) => <span key={cell}>{cell + 1}</span>)}</div>
          <div className="p-field"><label htmlFor="half-transfer">How many of eight equal cells make half?</label><input id="half-transfer" type="number" inputMode="numeric" min="0" max="8" step="1" value={record.answers.transfer ?? ""} onChange={event => answer("transfer", event.target.value)} disabled={!ready} /></div>
          <fieldset className="half-choice-group"><legend>Why does your answer make half?</legend>
            {[["equal-groups", "I can split the eight equal cells into two groups with the same number."], ["any-pieces", "Choosing any two pieces always makes half."], ["same-shape", "The selected cells must form the same shape as before."]].map(([value, label]) => <label key={value} className="p-choice"><input type="radio" name="half-reason" value={value} checked={record.answers.transferReason === value} onChange={() => answer("transferReason", value)} disabled={!ready} /><span>{label}</span></label>)}
          </fieldset>
          <button className="p-primary" type="submit" disabled={!ready}>Check and record my discovery <Check size={17} aria-hidden="true" /></button>
          {feedback && <div className={`p-assessment-feedback ${feedback.passed ? "is-success" : "is-error"}`} role="status"><strong>{feedback.passed ? "Discovery recorded." : "Keep investigating."}</strong><p>{feedback.feedback}</p></div>}
        </section>
      </form>
      <button className="p-text-link" type="button" disabled={!ready} onClick={() => { setFeedback(null); setTilted(false); setSelectionNotice(""); onChange({ settings: { selection: writeHalfSelection(DEFAULT_HALF_SELECTION) }, answers: {} }); }}>Start this investigation again</button>
    </>}
  </div>;
}
