const { db } = require('../database/db');

function findById(id) {
  return db.data.users.find(u => u.id === id) || null;
}

function findByUsername(username) {
  return db.data.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function findByEmail(email) {
  return db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function create(userData) {
  const user = {
    id: db.nextIds.users++,
    username: userData.username,
    email: userData.email,
    password_hash: userData.passwordHash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.data.users.push(user);
  return user;
}

function toSafeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at
  };
}

module.exports = { findById, findByUsername, findByEmail, create, toSafeUser };