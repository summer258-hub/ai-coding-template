function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

function isValidTodoTitle(title) {
  if (!title || typeof title !== 'string') return false;
  return title.length > 0 && title.length <= 200;
}

function isValidTodoDescription(desc) {
  if (desc === undefined || desc === null) return true;
  if (typeof desc !== 'string') return false;
  return desc.length <= 2000;
}

function isValidStatus(status) {
  return status === 'pending' || status === 'completed';
}

function isValidPriority(priority) {
  return priority === 'low' || priority === 'medium' || priority === 'high';
}

function isValidCategoryName(name) {
  if (!name || typeof name !== 'string') return false;
  return name.length > 0 && name.length <= 50;
}

function isValidTagName(name) {
  if (!name || typeof name !== 'string') return false;
  return name.length > 0 && name.length <= 30;
}

module.exports = {
  isValidUsername, isValidEmail, isValidPassword,
  isValidTodoTitle, isValidTodoDescription,
  isValidStatus, isValidPriority,
  isValidCategoryName, isValidTagName
};