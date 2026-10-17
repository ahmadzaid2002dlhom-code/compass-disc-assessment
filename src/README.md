# React frontend

The application uses **React + Vite**, with a separate **Node.js + Express** API in `api/`.

- `main.jsx`: mount point and global styles.
- `App.jsx`: navigation, session handling, invitation redemption, layout.
- `pages/`: homepage, staff login, participant assessment, facilitator/HR dashboard, and read-only equal-score demo.
- `components/`: shared reports, charts, indicators, and basic buttons.
- `lib/api.js`: one JSON HTTP request helper.
- `lib/disc.js`: presentation-only DISC labels and colors.
- `style.css`: existing shared visual styling.

Scoring rules and word-to-dimension mappings remain private on the Express backend.
The tie demonstration uses the normal report and scoring implementation without saving participants.
