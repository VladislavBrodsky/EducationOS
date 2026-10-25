# Frontend priorities

## First release: discovery → participation → invitation

The hero's illustrated card had an arrow but no action. It now opens the two-step mini-challenge in the visitor's current language, with a keyboard-focusable destination below the sticky header. The full seven-step mission remains a separate, clearly labeled route.

The mini-challenge shows two concrete steps. Its explanation step completes only after a valid check; errors, edits and reset cannot retain a solved state. After success, visitors can invite someone to try the same challenge. Shared links contain only the canonical localized public challenge URL, never answers or campaign query strings. Native sharing falls back to copying, then a selectable link. Cancellation produces no success message. Journal sharing reuses the same recovery path.

Acceptance: keyboard and no-JavaScript entry, Spanish/English/Russian flows, invalid/corrected/edited work, cancelled sharing, clipboard denial, accessibility and narrow layouts pass. Sharing tests use mocks and send nothing externally. No conversion or virality lift is claimed.

## Next: reduce the language handoff

Localize the seven-step learner mission and guardian guidance, with native-speaker review. Preserve evidence rules and error recovery across every locale. Completion should not depend on reading English after a localized landing page.

## Then: validate the growth loop

Run moderated usability sessions with adults using synthetic demo work. Check whether they can find, complete and share a challenge without help. Prioritize observed failures. Consider aggregate funnel measurement only after consent and retention requirements are decided; the current release introduces no trackers or learner identifiers. Expand journal experiments based on these findings rather than fabricated popularity or urgency.

Browser references: [Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share), [Clipboard](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).
