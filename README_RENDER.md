# Compass DISC — Render deployment

Full-stack DISC assessment with unique, private, invitation-only participant access. The public interface and requested domain branding do not contain third-party assistant names.

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

The application stores invited participant names, hashed invitation tokens, progress, reports and session token hashes in a private Blob object. Participants never create accounts or passwords; only facilitators and managers use staff passwords. Invitation tokens are 30-day, opaque bearer credentials and can be reopened to resume or view a completed report. The token is kept in the URL fragment, sent to the API only by POST, and removed from the browser address bar after redemption. The invitation link is shown once to staff and cannot be recovered from the stored hash. It never serves the object to visitors. This setup is intended for a small evaluation prototype using one Render instance. For heavier usage or production use, prefer the supplied PostgreSQL backend with a properly configured managed database.

### Verify

After deploying, check `https://<service>.onrender.com/api/?action=health`. Sign in as a facilitator or manager, invite a test participant and copy the unique link. Open that link in a separate/private browser tab, confirm there is no participant signup/password screen, save progress, revisit the invitation link and resume, finish the assessment and check the final report. Check staff dashboard permissions and persisted results after a service restart. Historical self-registration records are retained in storage but excluded from the invitation-only dashboard.

**Do not expose staff credentials or real participant data in public demo posts.**
