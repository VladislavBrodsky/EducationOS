import { ArrowRight, Timer } from "lucide-react";
import type { DemoDraft } from "@/lib/demo-state";
import { measurementComparison } from "@/lib/demo-state";

export function MeasurementComparison({ draft }: { draft: DemoDraft }) {
  const comparison = measurementComparison(draft);
  if (!comparison) return <div className="demo-empty-measurement"><Timer size={25} strokeWidth={1.5} aria-hidden="true" /><p>Your comparison appears after you record both measured times.</p></div>;
  return <figure className="demo-measurement"><figcaption>YOUR RECORDED COMPARISON</figcaption><div className="demo-measurement-values"><div><span>Flat paper</span><strong>{comparison.baseline}<small>seconds</small></strong></div><ArrowRight size={19} aria-hidden="true" /><div><span>Your redesign</span><strong>{comparison.redesigned}<small>seconds</small></strong></div></div><div className="demo-comparison-result">{comparison.difference === 0 ? "The same time was recorded in both trials." : `${Math.abs(comparison.difference)} seconds ${comparison.difference > 0 ? "longer" : "shorter"} in your redesign trial.`}</div><p>{comparison.capped ? "A value of 60 seconds reaches the trial limit; the actual time to collapse may be longer. " : ""}Two recorded trials show what happened here. Repeat trials would help check consistency.</p></figure>;
}
