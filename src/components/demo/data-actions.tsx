"use client";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { useDemo } from "./demo-provider";

export function DemoDataActions() {
  const { ready, clearDemo, downloadEvidence } = useDemo();
  const [confirm, setConfirm] = useState(false);
  return <div className="demo-data-actions"><div className="demo-data-actions-buttons"><button type="button" className="demo-button demo-button-dark" onClick={downloadEvidence} disabled={!ready}><Download size={16} aria-hidden="true" /> Export demo JSON</button><button type="button" className="demo-button demo-button-outline" onClick={() => setConfirm(true)} aria-expanded={confirm} aria-controls="demo-clear-confirmation" disabled={!ready}><Trash2 size={16} aria-hidden="true" /> Clear demo notes</button></div>{confirm && <div className="demo-clear-confirmation" id="demo-clear-confirmation" role="group" aria-label="Confirm clearing demo notes"><p><strong>Clear every age group’s notes in this tab?</strong> Export anything you want to keep first. Downloaded files stay on your device.</p><div><button type="button" className="demo-button demo-button-dark" onClick={() => { clearDemo(); setConfirm(false); }}>Clear all demo notes</button><button type="button" className="demo-button demo-button-outline" onClick={() => setConfirm(false)}>Keep my notes</button></div></div>}</div>;
}
