const { db } = require('../database/db');
const tagModel = require('./tagModel');

function findById(id) {
  const todo = db.data.todos.find(t => t.id === id);
  if (!todo) return null;
  return { ...todo, tags: tagModel.getTagsForTodo(id) };
}

function findAllByUserId(userId, options = {}) {
  let todos = db.data.todos.filter(t => t.user_id === userId);
  
  // 关键词搜索
  if (options.keyword) {
    const kw = options.keyword.toLowerCase();
    todos = todos.filter(t =>
      t.title.toLowerCase().includes(kw) ||
      (t.description && t.description.toLowerCase().includes(kw))
    );
  }
  
  // 状态筛选
  if (options.status && options.status !== 'all') {
    todos = todos.filter(t => t.status === options.status);
  }
  
  // 优先级筛选
  if (options.priority && options.priority !== 'all') {
    const priorities = Array.isArray(options.priority) ? options.priority : [options.priority];
    todos = todos.filter(t => priorities.includes(t.priority));
  }
  
  // 分类筛选
  if (options.category_id !== undefined && options.category_id !== 'all') {
    if (options.category_id === 'uncategorized') {
      todos = todos.filter(t => t.category_id === null || t.category_id === undefined);
    } else {
      const catIds = Array.isArray(options.category_id) ? options.category_id : [options.category_id];
      const catIdNums = catIds.map(Number);
      todos = todos.filter(t => catIdNums.includes(t.category_id));
    }
  }
  
  // 标签筛选（OR）
  if (options.tag_ids && options.tag_ids.length > 0) {
    const tagIds = options.tag_ids.map(Number);
    const todoIdsWithTags = db.data.todoTags
      .filter(tt => tagIds.includes(tt.tag_id))
      .map(tt => tt.todo_id);
    todos = todos.filter(t => todoIdsWithTags.includes(t.id));
  }
  
  // 排序（白名单收敛，避免读取不可预料的属性键）；非法值回退默认
  const SORTABLE = ['created_at', 'updated_at', 'priority', 'title'];
  const sortBy = SORTABLE.includes(options.sort_by) ? options.sort_by : 'created_at';
  const sortOrder = options.sort_order === 'asc' ? 'asc' : 'desc';
  
  todos.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      valA = priorityOrder[a.priority] || 0;
      valB = priorityOrder[b.priority] || 0;
    } else {
      valA = new Date(a[sortBy] || a.created_at).getTime();
      valB = new Date(b[sortBy] || b.created_at).getTime();
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });
  
  // 分页
  const page = parseInt(options.page) || 1;
  const pageSize = Math.min(parseInt(options.page_size) || 20, 100);
  const total = todos.length;
  const start = (page - 1) * pageSize;
  const paginatedTodos = todos.slice(start, start + pageSize);
  
  // 附加标签信息
  const todosWithTags = paginatedTodos.map(todo => ({
    ...todo,
    tags: tagModel.getTagsForTodo(todo.id)
  }));
  
  return {
    items: todosWithTags,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize)
  };
}

function create(userId, data) {
  const now = new Date().toISOString();
  const todo = {
    id: db.nextIds.todos++,
    user_id: userId,
    title: data.title,
    description: data.description || null,
    status: 'pending',
    priority: data.priority || 'medium',
    category_id: data.category_id || null,
    created_at: now,
    updated_at: now
  };
  db.data.todos.push(todo);
  
  // 设置标签
  if (data.tag_ids && data.tag_ids.length > 0) {
    tagModel.setTodoTags(todo.id, data.tag_ids);
  }
  
  return { ...todo, tags: tagModel.getTagsForTodo(todo.id) };
}

function update(id, data) {
  const todo = db.data.todos.find(t => t.id === id);
  if (!todo) return null;
  
  if (data.title !== undefined) todo.title = data.title;
  if (data.description !== undefined) todo.description = data.description;
  if (data.status !== undefined) todo.status = data.status;
  if (data.priority !== undefined) todo.priority = data.priority;
  if (data.category_id !== undefined) todo.category_id = data.category_id;
  todo.updated_at = new Date().toISOString();
  
  if (data.tag_ids !== undefined) {
    tagModel.setTodoTags(id, data.tag_ids);
  }
  
  return { ...todo, tags: tagModel.getTagsForTodo(id) };
}

function remove(id) {
  const index = db.data.todos.findIndex(t => t.id === id);
  if (index === -1) return false;
  db.data.todos.splice(index, 1);
  // 移除标签关联
  db.data.todoTags = db.data.todoTags.filter(tt => tt.todo_id !== id);
  return true;
}

module.exports = { findById, findAllByUserId, create, update, remove };