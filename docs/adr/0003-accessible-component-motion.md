# 0003 — Accessible component motion and catalog

Accepted 30 October 2026

The requested Magic UI catalog spans continuous motion, visual effects, device mockups and community integrations with different dependencies. EducationOS needs a useful component workbench and selected motion on real pages while preserving readable educational content, keyboard navigation and its Python API architecture.

Maintain a checked, machine-readable inventory of all 77 official catalog references in eight groups. The `/components` workbench provides 16 local previews, clearly distinguishes the other 61 reference links, and mounts only the selected preview. It is excluded from search indexing and uses synthetic examples. Device mockups, external social embeds and unrelated effects are not installed merely to populate the catalog.

Adapt the selected interfaces with existing React, scoped CSS, IntersectionObserver and Web Animations APIs. No runtime dependencies are added. Retain MIT notices and link upstream source provenance. The homepage uses Marquee and Word Rotate; journal articles use Scroll Progress. Existing learning controls retain their native interactions.

Continuous decorative motion is static on the server, without JavaScript and under reduced-motion preferences. Shared manual pause, off-screen suspension and document visibility are respected. The marquee pauses for hover and focus, exposes a single accessible primary list and hides its inert duplicate. Word rotation has one stable accessible label and reserves space. Reading position is decorative and never presented as learning progress, mastery or achievement.

The workbench is English-only and labels its footer entry accordingly. Live homepage additions are translated in English, Spanish and Russian. Heavy or third-party reference components require a separate product need, dependency/license review and equivalent accessibility checks before later integration.

This decision changes presentation only. Adult authorization, consent boundaries, child profiles and learner AI gates remain enforced by the existing Python backend. No production rollout is part of this change.
