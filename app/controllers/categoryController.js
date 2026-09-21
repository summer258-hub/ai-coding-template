const categoryModel = require('../models/categoryModel');
const { isValidCategoryName } = require('../utils/validators');

const SORTABLE_FIELDS = ['name', 'created_at'];
const SORTABLE_ORDERS = ['asc', 'desc'];

function list(req, res, next) {
  try {
    if (req.query.sort_by && !SORTABLE_FIELDS.includes(req.query.sort_by)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '排序字段不合法' } });
    }
    if (req.query.sort_order && !SORTABLE_ORDERS.includes(req.query.sort_order)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '排序方向不合法' } });
    }
    const categories = categoryModel.findAllByUserId(req.userId, {
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
}

function create(req, res, next) {
  try {
    const { name, color } = req.body;
    if (!isValidCategoryName(name)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '分类名称不能为空且不超过50字符' }
      });
    }
    if (categoryModel.findByUserIdAndName(req.userId, name)) {
      return res.status(409).json({
        success: false,
        error: { code: 'NAME_EXISTS', message: '分类名称已存在' }
      });
    }
    const category = categoryModel.create(req.userId, { name, color });
    res.status(201).json({ success: true, data: category, message: '创建成功' });
  } catch (err) { next(err); }
}

function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const category = categoryModel.findById(id);
    if (!category || category.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '分类不存在' }
      });
    }
    const { name, color } = req.body;
    if (name !== undefined && !isValidCategoryName(name)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '分类名称不合法' }
      });
    }
    if (name && name !== category.name && categoryModel.findByUserIdAndName(req.userId, name)) {
      return res.status(409).json({
        success: false,
        error: { code: 'NAME_EXISTS', message: '分类名称已存在' }
      });
    }
    const updated = categoryModel.update(id, { name, color });
    res.json({ success: true, data: updated, message: '更新成功' });
  } catch (err) { next(err); }
}

function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const category = categoryModel.findById(id);
    if (!category || category.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '分类不存在' }
      });
    }
    categoryModel.remove(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };