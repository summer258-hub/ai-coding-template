const { db } = require('../database/db');

function findAllByUserId(userId, options = {}) {
  const categories = db.data.categories.filter(c => c.user_id === userId);
  // 排序（白名单收敛，避免读取不可预料的属性键）；非法值回退默认
  const SORTABLE = ['name', 'created_at'];
  const sortBy = SORTABLE.includes(options.sort_by) ? options.sort_by : 'created_at';
  const sortOrder = options.sort_order === 'asc' ? 'asc' : 'desc';
  return categories.slice().sort((a, b) => {
    let cmp;
    if (sortBy === 'name') {
      cmp = String(a.name || '').localeCompare(String(b.name || ''));
    } else {
      cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });
}

function findById(id) {
  return db.data.categories.find(c => c.id === id) || null;
}

function findByUserIdAndName(userId, name) {
  return db.data.categories.find(c => c.user_id === userId && c.name.toLowerCase() === name.toLowerCase()) || null;
}

function create(userId, data) {
  const category = {
    id: db.nextIds.categories++,
    user_id: userId,
    name: data.name,
    color: data.color || null,
    created_at: new Date().toISOString()
  };
  db.data.categories.push(category);
  return category;
}

function update(id, data) {
  const category = findById(id);
  if (!category) return null;
  if (data.name !== undefined) category.name = data.name;
  if (data.color !== undefined) category.color = data.color;
  return category;
}

function remove(id) {
  const index = db.data.categories.findIndex(c => c.id === id);
  if (index === -1) return false;
  db.data.categories.splice(index, 1);
  // 将该分类下的 todo 的 category_id 置空
  db.data.todos.forEach(todo => {
    if (todo.category_id === id) todo.category_id = null;
  });
  return true;
}

module.exports = { findAllByUserId, findById, findByUserIdAndName, create, update, remove };