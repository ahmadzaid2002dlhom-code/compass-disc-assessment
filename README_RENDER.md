# Compass DISC — Render deployment

Full-stack DISC participant assessment. The public interface and requested domain branding do not contain third-party assistant names.

## Requirements

Node.js 22+, one Render web service, and a private Vercel Blob store (or use the separately supplied PostgreSQL version).

## Render Web Service

- Source: your own GitHub repository containing these files
- Name: `compass-disc-assessment` (or another name you choose)
- Runtime: Node
- Build command: `npm install && npm test && npm run build`
- Start command: `npm start`
- Region: Frankfurt

### Private environment variables

- `BLOB_READ_WRITE_TOKEN`: a private read/write token from a Vercel Blob private store; do not include in the repository.
- `APP_DATA_PATH`: `compass-disc-v2/participants-state.json` (set a unique path for a new deployment).
- `STAFF_FACILITATOR_PASSWORD`: a strong, unique initial password.
- `STAFF_MANAGER_PASSWORD`: a different strong initial password.
- `NODE_ENV`: `production`

The application stores participant accounts, password hashes, progress, reports, and session token hashes in a private Blob object, with consistent reads and conditional writes. It never serves the object to visitors. This setup is intended for a small evaluation prototype using one Render instance. For heavier usage or production use, prefer the supplied PostgreSQL backend with a properly configured managed database.

### Verify

After deploying, check `https://<service>.onrender.com/api/?action=health` and register a test account at the root. Confirm account login, answer progress after logout/login, final report, staff dashboard restrictions, and data after a service restart.

**Do not expose staff credentials or real participant data in public demo posts.**
