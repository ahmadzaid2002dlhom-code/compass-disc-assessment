// Staff usernames are fixed: "manager" and "facilitator".
// When Render environment passwords change, synchronize their stored hashes
// at startup. Never log, return, or commit the password values.
export async function syncStaffCredentials(state, env, hashPassword, verifyPassword) {
  state.staff_users ??= {};
  const configured = [];
  const updated = [];
  const missing = [];
  for (const role of ['facilitator', 'manager']) {
    const key = `STAFF_${role.toUpperCase()}_PASSWORD`;
    const password = env[key];
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      missing.push(key);
      continue;
    }
    configured.push(role);
    const existing = state.staff_users[role];
    const matches = existing?.password_hash
      ? await verifyPassword(password, existing.password_hash)
      : false;
    if (!matches || existing.role !== role) {
      state.staff_users[role] = { role, password_hash: await hashPassword(password) };
      updated.push(role);
    }
  }
  return { configured, updated, missing };
}
