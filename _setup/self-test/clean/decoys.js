// Decoys: code that LOOKS suspicious but is benign. The gate must NOT block it.
// Self-test fixture: scanning this directory should PASS the gate (non-strict).

const User = require('./userModel');
const { sign } = require('jsonwebtoken');

// token is a variable holding a function CALL, not a string literal secret.
function gen(user) {
  const token = generateToken(user); // generateToken() is a runtime call
  return { token };
}

// Short / non-secret-looking string values: must not trip the secret rule.
function profile(args) {
  const email = 'a@b.com';
  const name = args.name;
  const password = 'changeme'; // too short, placeholder only
  return { email, name, password };
}

// In-memory repo helper: read-only, entity known at boot (not request-derived).
async function lookup(userId) {
  const record = await User.findById(userId);
  return record ? record.name : null;
}

// Standard token in a well-named env-backed helper, actual value from process.env.
function makeRefresh(secret) {
  return sign({ scope: 'refresh' }, secret, { algorithm: 'HS256' });
}

module.exports = { gen, profile, lookup, makeRefresh };