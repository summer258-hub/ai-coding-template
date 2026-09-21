const { db } = require('../database/db');

function findAllByUserId(userId, options = {}) {
  const tags = db.data.tags.filter(t => t.user_id === userId);
  // 排序（白名单收敛，避免读取不可预料的属性键）；非法值回退默认
  const SORTABLE = ['name', 'created_at'];
  const sortBy = SORTABLE.includes(options.sort_by) ? options.sort_by : 'created_at';
  const sortOrder = options.sort_order === 'asc' ? 'asc' : 'desc';
  return tags.slice().sort((a, b) => {
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
  return db.data.tags.find(t => t.id === id) || null;
}

function findByUserIdAndName(userId, name) {
  return db.data.tags.find(t => t.user_id === userId && t.name.toLowerCase() === name.toLowerCase()) || null;
}

function create(userId, data) {
  const tag = {
    id: db.nextIds.tags++,
    user_id: userId,
    name: data.name,
    created_at: new Date().toISOString()
  };
  db.data.tags.push(tag);
  return tag;
}

function update(id, data) {
  const tag = findById(id);
  if (!tag) return null;
  if (data.name !== undefined) tag.name = data.name;
  return tag;
}

function remove(id) {
  const index = db.data.tags.findIndex(t => t.id === id);
  if (index === -1) return false;
  db.data.tags.splice(index, 1);
  // 移除 todo_tag 关联
  db.data.todoTags = db.data.todoTags.filter(tt => tt.tag_id !== id);
  return true;
}

// Todo 标签关联
function getTagsForTodo(todoId) {
  const tagIds = db.data.todoTags
    .filter(tt => tt.todo_id === todoId)
    .map(tt => tt.tag_id);
  return db.data.tags.filter(t => tagIds.includes(t.id));
}

function setTodoTags(todoId, tagIds) {
  // 移除旧关联
  db.data.todoTags = db.data.todoTags.filter(tt => tt.todo_id !== todoId);
  // 添加新关联
  tagIds.forEach(tagId => {
    db.data.todoTags.push({ todo_id: todoId, tag_id: tagId });
  });
}

module.exports = { findAllByUserId, findById, findByUserIdAndName, create, update, remove, getTagsForTodo, setTodoTags };