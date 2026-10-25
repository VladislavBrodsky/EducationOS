# Interactive task contract

Every activity needs a visible goal, usable controls, a check action, specific correction feedback, a retry path, and an explicit completion state. A decorative diagram cannot be labelled as a solvable activity. The public paper-bridge panel now checks a two-action design challenge; it does not simulate load capacity.

| Surface | Check |
| --- | --- |
| Landing mini-challenge, ES/EN/RU | Fold the same sheet and identify the changed feature |
| Three practice-code lessons | Bounded interpreter syntax and the stated output |
| Seven multiple-choice lessons | The authored correct option and explanation |
| Four writing lessons | Visible length requirement; writing quality requires human review |
| One physical experiment lesson | Required observations and bounded measurements; no verification of a physical result |
| Three discovery labs | Independent observation and transfer questions, including manipulation where required |
| Seven-step Inventors Lab | Each required evidence entry, two distinct designs, valid measurements, and all seven steps before completion |

Shared feedback identifies errors in text, associates them with the relevant control, and provides a route back to that answer. Editing clears the old result and invalidates a recorded objective task until it is checked again. Valid recorded work restores its success state on reload. Predictions can be wrong; they are starting points, rather than completion grades. No points, fabricated experimental results, learner identities, or remote submissions are introduced.

The implementation follows W3C guidance on [error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification) and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages). This is an implementation approach, not a claim of accessibility certification.

Regression coverage lives in `tests/e2e/interactive-workflow.spec.ts`, the existing lesson/lab journeys, and `tests/paper-bridge-challenge.test.ts`. It exercises incorrect, corrected, restored, and edited states across all fifteen lessons, the landing languages, mobile code recovery, missing lab predictions, and the mission completion gate.
