// 内存数据存储（替代 SQLite，简化演示）
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const db = {
  data: {
    users: [],
    categories: [],
    tags: [],
    todos: [],
    todoTags: []
  },
  nextIds: {
    users: 1,
    categories: 1,
    tags: 1,
    todos: 1
  }
};

function loadFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      db.data = parsed.data || db.data;
      db.nextIds = parsed.nextIds || db.nextIds;
    }
  } catch (err) {
    console.error('Failed to load data:', err.message);
  }
}

function saveToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ data: db.data, nextIds: db.nextIds }, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save data:', err.message);
  }
}

function reset() {
  // 清空数组而不是重新赋值，保持引用不变
  db.data.users.length = 0;
  db.data.categories.length = 0;
  db.data.tags.length = 0;
  db.data.todos.length = 0;
  db.data.todoTags.length = 0;
  db.nextIds.users = 1;
  db.nextIds.categories = 1;
  db.nextIds.tags = 1;
  db.nextIds.todos = 1;
}

loadFromFile();

module.exports = { db, saveToFile, reset };