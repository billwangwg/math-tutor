# Changelog

## [0.2.0] - 2026-01-12

### Added
- **MathText Component**: New robust component for rendering LaTeX math formulas with auto-repair and scoped styling.
- **Streaming API**: `/api/analyze` now supports streaming responses for faster user feedback.
- **Robust JSON Parsing**: Added `robustJsonParse` utility to handle and repair malformed AI JSON output.
- **Image Compression**: Client-side image compression before upload to optimize bandwidth.
- **Loading State Logs**: Detailed, real-time logging during the "Loading" phase.
- **Regenerate Quiz**: Added "Regenerate" button to retry analysis on the same image.

### Changed
- **Wizard & Quiz**: Refactored to use `<MathText />` for all math rendering, replacing `dangerouslySetInnerHTML`.
- **API Limits**: Added server-side rate limiting (500 req / 60s) and increased max duration to 60s.
- **Codebase**: Removed deprecated `renderMath` utility and empty `src/lib` directory.

### Fixed
- **LaTeX Rendering**: Resolved issues with "naked" LaTeX commands (e.g., `\angle`, `\sqrt`) not rendering correctly.
- **Jitter**: Added fade-in animation to math elements to prevent layout shifts.
