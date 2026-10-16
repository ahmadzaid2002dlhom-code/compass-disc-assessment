# Compass DISC Assessment

React and Express DISC assessment web prototype with participant signup, private login, 14 word groups, scores, and separate facilitator / manager dashboards.

## Running locally

Requirements: Node.js 22+, access to a private Vercel Blob store, and the environment variables in `.env.example`.

```bash
npm install
npm test
npm run build
npm start
```

The website requires `BLOB_READ_WRITE_TOKEN` and unique staff passwords in the hosting platform environment settings. No secrets are checked into the repository. For deployment details, see `README_RENDER.md`.

Profile mapping and Arabic descriptions are sourced from the supplied assessment workbook.
