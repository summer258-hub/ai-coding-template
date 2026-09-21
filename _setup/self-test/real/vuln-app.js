// Genuine vulnerabilities that the gate MUST flag (ERROR -> blocks push).
// Self-test fixture: scanning this directory should FAIL the gate.

const express = require('express');
const User = require('./userModel');
const jwt = require('jsonwebtoken');

const app = express();

// 1) Hardcoded secret in a config-style literal (sk-live token).
const jwtSecret = 'sk-live-9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f';
const app2 = express();

// 2) eval() on untrusted input -> code injection / RCE.
app.use((req, res, next) => {
  const expr = req.body.expression;
  const result = eval(expr); // eslint-disable-line no-eval
  res.json({ result });
});

// 3) Unsafe DB query built from request input (WARNING level).
app.post('/login', (req, res) => {
  const username = req.body.username;
  if (User.findByUsername(username)) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});

// 4) JWT signed with 'none' algorithm -> forgeable tokens.
function issueToken(payload) {
  return jwt.sign(payload, '', { algorithm: 'none' }); // eslint-disable-line no-unused-vars
}

module.exports = { app, jwtSecret };