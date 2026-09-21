const tagModel = require('../models/tagModel');
const { isValidTagName } = require('../utils/validators');

function list(req, res, next) {
  try {
    if (req.query.sort_by && !['name', 'created_at'].includes(req.query.sort_by)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '排序字段不合法' } });
    }
    if (req.query.sort_order && !['asc', 'desc'].includes(req.query.sort_order)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '排序方向不合法' } });
    }
    const tags = tagModel.findAllByUserId(req.userId, {
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    });
    res.json({ success: true, data: tags });
  } catch (err) { next(err); }
}

function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!isValidTagName(name)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '标签名称不能为空且不超过30字符' }
      });
    }
    if (tagModel.findByUserIdAndName(req.userId, name)) {
      return res.status(409).json({
        success: false,
        error: { code: 'NAME_EXISTS', message: '标签名称已存在' }
      });
    }
    const tag = tagModel.create(req.userId, { name });
    res.status(201).json({ success: true, data: tag, message: '创建成功' });
  } catch (err) { next(err); }
}

function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const tag = tagModel.findById(id);
    if (!tag || tag.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '标签不存在' }
      });
    }
    const { name } = req.body;
    if (name !== undefined && !isValidTagName(name)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '标签名称不合法' }
      });
    }
    if (name && name !== tag.name && tagModel.findByUserIdAndName(req.userId, name)) {
      return res.status(409).json({
        success: false,
        error: { code: 'NAME_EXISTS', message: '标签名称已存在' }
      });
    }
    const updated = tagModel.update(id, { name });
    res.json({ success: true, data: updated, message: '更新成功' });
  } catch (err) { next(err); }
}

function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const tag = tagModel.findById(id);
    if (!tag || tag.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '标签不存在' }
      });
    }
    tagModel.remove(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };