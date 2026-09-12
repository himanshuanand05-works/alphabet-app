# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Display a real photo of an animal associated with each letter when a letter is activated. Images are loaded from `public/animals/` and are courtesy of [Wikimedia Commons](https://commons.wikimedia.org) under their respective CC/Public Domain licenses.
- "Images" toggle in the header that switches animal images on/off; preference is saved in `localStorage` and restored on load.

## [1.0.0] - 2026-09-12

### Added
- Interactive alphabet explorer that shows a large animated letter when pressed.
- On-screen tappable alphabet grid (`A`–`Z`) with per-letter accent colors.
- Mobile-friendly on-screen keyboard (QWERTY layout) with clickable keys.
- Three associated word chips are displayed for each activated letter (e.g. `A` → Apple, Ant, Airplane).
- Text-to-speech pronunciation of each letter using a female voice when available.
- Musical tone feedback where each letter maps to a note frequency.
- Animated UI: letter pop-in/bounce, glow ring pulse, background flash, floating particles, and gradient title.
- Keyboard support: pressing any `A`–`Z` key activates that letter.
- Idle state prompting the user to press a letter or tap a key.
- Responsive layout with a reduced mobile style.

[Unreleased]: https://github.com/himanshuanand05-works/alphabet-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/himanshuanand05-works/alphabet-app/releases/tag/v1.0.0