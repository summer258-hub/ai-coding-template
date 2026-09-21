const todoModel = require('../models/todoModel');
const categoryModel = require('../models/categoryModel');
const tagModel = require('../models/tagModel');
const { isValidTodoTitle, isValidTodoDescription, isValidStatus, isValidPriority } = require('../utils/validators');

const SORTABLE_FIELDS = ['created_at', 'updated_at', 'priority', 'title'];
const SORTABLE_ORDERS = ['asc', 'desc'];

function list(req, res, next) {
  try {
    if (req.query.sort_by && !SORTABLE_FIELDS.includes(req.query.sort_by)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '排序字段不合法' } });
    }
    if (req.query.sort_order && !SORTABLE_ORDERS.includes(req.query.sort_order)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '排序方向不合法' } });
    }
    const options = {
      keyword: req.query.keyword,
      status: req.query.status,
      priority: req.query.priority,
      category_id: req.query.category_id,
      tag_ids: req.query.tag_ids ? req.query.tag_ids.split(',').map(Number) : [],
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
      page: req.query.page,
      page_size: req.query.page_size
    };
    const result = todoModel.findAllByUserId(req.userId, options);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const todo = todoModel.findById(id);
    if (!todo || todo.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Todo不存在' }
      });
    }
    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}

function create(req, res, next) {
  try {
    const { title, description, priority, category_id, tag_ids } = req.body;
    
    if (!isValidTodoTitle(title)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '标题不能为空且不超过200字符' }
      });
    }
    if (!isValidTodoDescription(description)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '描述不能超过2000字符' }
      });
    }
    if (priority && !isValidPriority(priority)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '优先级值不合法' }
      });
    }
    if (category_id) {
      const cat = categoryModel.findById(parseInt(category_id));
      if (!cat || cat.user_id !== req.userId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '分类不存在' }
        });
      }
    }
    if (tag_ids && Array.isArray(tag_ids)) {
      const validTags = tag_ids.filter(tid => {
        const tag = tagModel.findById(parseInt(tid));
        return tag && tag.user_id === req.userId;
      });
      if (validTags.length !== tag_ids.length) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '部分标签不存在' }
        });
      }
    }
    
    const todo = todoModel.create(req.userId, {
      title, description, priority, category_id: category_id ? parseInt(category_id) : null, tag_ids
    });
    
    res.status(201).json({ success: true, data: todo, message: '创建成功' });
  } catch (err) { next(err); }
}

function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const todo = todoModel.findById(id);
    if (!todo || todo.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Todo不存在' }
      });
    }
    
    const { title, description, status, priority, category_id, tag_ids } = req.body;
    
    if (title !== undefined && !isValidTodoTitle(title)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '标题不合法' }
      });
    }
    if (description !== undefined && !isValidTodoDescription(description)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '描述不合法' }
      });
    }
    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '状态值不合法' }
      });
    }
    if (priority !== undefined && !isValidPriority(priority)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '优先级值不合法' }
      });
    }
    
    const updated = todoModel.update(id, {
      title, description, status, priority,
      category_id: category_id !== undefined ? parseInt(category_id) : undefined,
      tag_ids
    });
    
    res.json({ success: true, data: updated, message: '更新成功' });
  } catch (err) { next(err); }
}

function updateStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const todo = todoModel.findById(id);
    if (!todo || todo.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Todo不存在' }
      });
    }
    const { status } = req.body;
    if (!isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '状态值不合法' }
      });
    }
    const updated = todoModel.update(id, { status });
    res.json({ success: true, data: updated, message: '状态更新成功' });
  } catch (err) { next(err); }
}

function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const todo = todoModel.findById(id);
    if (!todo || todo.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Todo不存在' }
      });
    }
    todoModel.remove(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, updateStatus, remove };