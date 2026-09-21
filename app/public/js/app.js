// 主应用逻辑
const App = {
  state: {
    user: null,
    categories: [],
    tags: [],
    todos: [],
    total: 0,
    page: 1,
    pageSize: 20,
    filters: {
      keyword: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      tag: 'all',
      sort_by: 'created_at',
      sort_order: 'desc'
    },
    isLoginMode: true,
    editingTodoId: null,
    confirmCallback: null,
    quickAddType: null,
    quickAddEditId: null,
    quickAddColor: null
  },

  async init() {
    this.bindAuthEvents();
    this.bindAppEvents();
    const token = API.getToken();
    if (token) {
      try {
        const user = await API.auth.me();
        this.state.user = user;
        this.showApp();
        await this.loadCategories();
        await this.loadTags();
        await this.loadTodos();
      } catch (err) {
        API.clearToken();
        this.showAuth();
      }
    } else {
      this.showAuth();
    }
  },

  showAuth() {
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('app-page').style.display = 'none';
  },

  showApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app-page').style.display = 'block';
    document.getElementById('user-display').textContent = this.state.user.username;
  },

  bindAuthEvents() {
    const form = document.getElementById('auth-form');
    const switchLink = document.getElementById('switch-link');
    const switchText = document.getElementById('switch-text');
    const title = document.getElementById('auth-title');
    const submit = document.getElementById('auth-submit');
    const emailGroup = document.getElementById('email-group');

    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.state.isLoginMode = !this.state.isLoginMode;
      if (this.state.isLoginMode) {
        title.textContent = '登录';
        submit.textContent = '登录';
        switchText.textContent = '还没有账号？';
        switchLink.textContent = '立即注册';
        emailGroup.style.display = 'none';
      } else {
        title.textContent = '注册';
        submit.textContent = '注册';
        switchText.textContent = '已有账号？';
        switchLink.textContent = '立即登录';
        emailGroup.style.display = 'block';
      }
      document.getElementById('auth-error').style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const email = document.getElementById('email').value.trim();
      const errorEl = document.getElementById('auth-error');
      try {
        let result;
        if (this.state.isLoginMode) {
          result = await API.auth.login(username, password);
        } else {
          if (!email) throw new Error('请输入邮箱');
          result = await API.auth.register(username, email, password);
        }
        API.setToken(result.token);
        this.state.user = result.user;
        this.showApp();
        await this.loadCategories();
        await this.loadTags();
        await this.loadTodos();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      API.clearToken();
      this.state.user = null;
      this.showAuth();
    });
  },

  async loadCategories() {
    this.state.categories = await API.categories.list();
    this.renderCategories();
  },

  renderCategories() {
    const list = document.getElementById('category-list');
    let html = '<li class="filter-item ' + (this.state.filters.category === 'all' ? 'active' : '') + '" data-category="all" tabindex="0"><span class="cat-name">全部</span></li>';
    html += '<li class="filter-item ' + (this.state.filters.category === 'uncategorized' ? 'active' : '') + '" data-category="uncategorized" tabindex="0"><span class="cat-name">未分类</span></li>';
    if (this.state.categories.length === 0) {
      html += '<li class="sidebar-empty">暂无分类,点击 + 创建第一个</li>';
    }
    this.state.categories.forEach(cat => {
      const active = this.state.filters.category == cat.id ? 'active' : '';
      const dotColor = cat.color || '#ccc';
      const count = this.state.todos.filter(t => t.category_id === cat.id).length;
      html += '<li class="filter-item ' + active + '" data-category="' + cat.id + '">';
      html += '<span class="cat-dot" style="background:' + dotColor + '"></span>';
      html += '<span class="cat-name">' + this.escape(cat.name) + '</span>';
      html += '<span class="cat-count">' + count + '</span>';
      html += '<span class="item-actions">';
      html += '<button class="item-action-btn" data-action="edit" data-id="' + cat.id + '" title="编辑">&#9998;</button>';
      html += '<button class="item-action-btn danger" data-action="delete" data-id="' + cat.id + '" title="删除">&#10005;</button>';
      html += '</span>';
      html += '</li>';
    });
    list.innerHTML = html;
    list.querySelectorAll('.filter-item').forEach(item => {
      const catId = item.dataset.category;
      item.addEventListener('click', (e) => {
        if (e.target.closest('.item-action-btn')) return;
        this.state.filters.category = catId;
        this.state.page = 1;
        this.renderCategories();
        this.loadTodos();
      });
    });
    list.querySelectorAll('.item-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        if (btn.dataset.action === 'edit') {
          this.openQuickAdd('category', id);
        } else {
          const cat = this.state.categories.find(c => c.id === id);
          const catCopy = { ...cat };
          await API.categories.remove(id);
          if (this.state.filters.category == id) this.state.filters.category = 'all';
          await this.loadCategories();
          await this.loadTodos();
          var s=this; setTimeout(function(){s.showToast('已删除分类「' + catCopy.name + '」', '撤销', async () => {
            await API.categories.create(catCopy.name, catCopy.color);
            await this.loadCategories();
            await s.loadTodos();
          });}, 50);
        }
      });
    });
  },

  async loadTags() {
    this.state.tags = await API.tags.list();
    this.renderTags();
  },

  renderTags() {
    const list = document.getElementById('tag-list');
    let html = '<li class="tag-item ' + (this.state.filters.tag === 'all' ? 'active' : '') + '" data-tag="all" tabindex="0"><span class="tag-name">全部</span></li>';
    if (this.state.tags.length === 0) {
      html += '<li class="sidebar-empty" style="list-style:none">暂无标签,点击 + 创建</li>';
    }
    this.state.tags.forEach(tag => {
      html += '<li class="tag-item ' + (this.state.filters.tag == tag.id ? 'active' : '') + '" data-tag="' + tag.id + '">';
      html += '<span class="tag-name">' + this.escape(tag.name) + '</span>';
      html += '<button class="tag-del" data-id="' + tag.id + '" title="删除">&times;</button>';
      html += '</li>';
    });
    list.innerHTML = html;
    list.querySelectorAll('.tag-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.tag-del')) return;
        this.state.filters.tag = item.dataset.tag;
        this.state.page = 1;
        this.renderTags();
        this.loadTodos();
      });
    });
    list.querySelectorAll('.tag-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const tag = this.state.tags.find(t => t.id === id);
        const tagName = tag.name;
        await API.tags.remove(id);
        if (this.state.filters.tag == id) this.state.filters.tag = 'all';
        await this.loadTags();
        await this.loadTodos();
        var s=this; setTimeout(function(){s.showToast('已删除标签「' + tagName + '」', '撤销', async () => {
          await API.tags.create(tagName);
          await s.loadTags();
          await s.loadTodos();
        });}, 50);
      });
    });
  },
  async loadTodos() {
    const params = {
      page: this.state.page,
      page_size: this.state.pageSize,
      keyword: this.state.filters.keyword,
      status: this.state.filters.status,
      priority: this.state.filters.priority,
      sort_by: this.state.filters.sort_by,
      sort_order: this.state.filters.sort_order
    };
    if (this.state.filters.category !== 'all') {
      params.category_id = this.state.filters.category;
    }
    if (this.state.filters.tag !== 'all') {
      params.tag_ids = this.state.filters.tag;
    }
    const result = await API.todos.list(params);
    this.state.todos = result.items;
    this.state.total = result.total;
    this.renderTodos();
    this.renderPagination();
  },
  renderTodos() {
    const list = document.getElementById('todo-list');
    if (this.state.todos.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="icon">📝</div><p>暂无 Todo，点击右上角创建一个吧！</p></div>';
      return;
    }
    let html = '';
    this.state.todos.forEach(todo => {
      const done = todo.status === 'completed';
      let tagHtml = '';
      if (todo.tags && todo.tags.length) {
        tagHtml = '<div class="todo-tags">' + todo.tags.map(t => '<span class="todo-tag">#' + this.escape(t.name) + '</span>').join('') + '</div>';
      }
      const cat = this.state.categories.find(c => c.id === todo.category_id);
      const catHtml = cat ? '<span class="category-badge">' + this.escape(cat.name) + '</span>' : '';
      html += '<div class="todo-item ' + (done ? 'completed' : '') + '" data-id="' + todo.id + '">';
      html += '<input type="checkbox" class="todo-checkbox" ' + (done ? 'checked' : '') + '>';
      html += '<div class="todo-content">';
      html += '<div class="todo-title">' + this.escape(todo.title) + '</div>';
      if (todo.description) html += '<div class="todo-description">' + this.escape(todo.description) + '</div>';
      html += '<div class="todo-meta">';
      html += '<span class="priority-badge priority-' + todo.priority + '">' + this.priText(todo.priority) + '</span>';
      html += catHtml + tagHtml;
      html += '</div></div>';
      html += '<div class="todo-actions"><button class="edit-btn">编辑</button><button class="delete-btn">删除</button></div>';
      html += '</div>';
    });
    list.innerHTML = html;
    list.querySelectorAll('.todo-item').forEach(item => {
      const id = parseInt(item.dataset.id);
      item.querySelector('.todo-checkbox').addEventListener('change', (e) => {
        const s = e.target.checked ? 'completed' : 'pending';
        API.todos.updateStatus(id, s).then(() => this.loadTodos());
      });
      item.querySelector('.edit-btn').addEventListener('click', () => this.openModal(id));
      item.querySelector('.delete-btn').addEventListener('click', () => this.confirmDel(id));
    });
  },
  renderPagination() {
    const totalPages = Math.ceil(this.state.total / this.state.pageSize);
    const el = document.getElementById('pagination');
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '<button ' + (this.state.page === 1 ? 'disabled' : '') + ' data-p="' + (this.state.page - 1) + '">上一页</button>';
    for (let i = 1; i <= totalPages; i++) {
      html += '<button class="' + (i === this.state.page ? 'active' : '') + '" data-p="' + i + '">' + i + '</button>';
    }
    html += '<button ' + (this.state.page === totalPages ? 'disabled' : '') + ' data-p="' + (this.state.page + 1) + '">下一页</button>';
    el.innerHTML = html;
    el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this.state.page = parseInt(btn.dataset.p);
        this.loadTodos();
      });
    });
  },

  openModal(id) {
    this.state.editingTodoId = id || null;
    document.getElementById('modal-title').textContent = id ? '编辑 Todo' : '新建 Todo';
    const catSel = document.getElementById('todo-category');
    catSel.innerHTML = '<option value="">无分类</option>' + this.state.categories.map(c => '<option value="' + c.id + '">' + this.escape(c.name) + '</option>').join('');
    const tagsDiv = document.getElementById('todo-tags');
    tagsDiv.innerHTML = this.state.tags.map(t => '<label><input type="checkbox" value="' + t.id + '" class="tag-cb"> ' + this.escape(t.name) + '</label>').join('');
    if (id) {
      const todo = this.state.todos.find(t => t.id === id);
      if (todo) {
        document.getElementById('todo-title').value = todo.title;
        document.getElementById('todo-description').value = todo.description || '';
        document.getElementById('todo-priority').value = todo.priority;
        document.getElementById('todo-category').value = todo.category_id || '';
        const tagIds = todo.tags ? todo.tags.map(t => t.id) : [];
        document.querySelectorAll('.tag-cb').forEach(cb => { cb.checked = tagIds.includes(parseInt(cb.value)); });
      }
    } else {
      document.getElementById('todo-title').value = '';
      document.getElementById('todo-description').value = '';
      document.getElementById('todo-priority').value = 'medium';
      document.getElementById('todo-category').value = '';
      document.querySelectorAll('.tag-cb').forEach(cb => { cb.checked = false; });
    }
    document.getElementById('todo-modal').style.display = 'flex';
    this.setInert(document.getElementById('todo-modal'));
  },

  closeModal() {
    document.getElementById('todo-modal').style.display = 'none';
    this.state.editingTodoId = null;
    this.clearInert();
  },

  async saveTodo(e) {
    e.preventDefault();
    const title = document.getElementById('todo-title').value.trim();
    const description = document.getElementById('todo-description').value.trim();
    const priority = document.getElementById('todo-priority').value;
    const category_id = document.getElementById('todo-category').value;
    const tag_ids = Array.from(document.querySelectorAll('.tag-cb:checked')).map(cb => parseInt(cb.value));
    try {
      if (this.state.editingTodoId) {
        await API.todos.update(this.state.editingTodoId, { title, description, priority, category_id: category_id || null, tag_ids });
      } else {
        await API.todos.create({ title, description, priority, category_id: category_id || null, tag_ids });
      }
      this.closeModal();
      this.loadTodos();
    } catch (err) { alert(err.message); }
  },

  confirmDel(id) {
    this.showConfirm('删除确认', '确定要删除这个 Todo 吗？', async () => {
      await API.todos.remove(id);
      this.loadTodos();
    });
  },

  showConfirm(title, msg, cb) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = msg;
    this.state.confirmCallback = cb;
    document.getElementById('confirm-modal').style.display = 'flex';
  },

  closeConfirm() {
    document.getElementById('confirm-modal').style.display = 'none';
    this.state.confirmCallback = null;
    this.clearInert();
  },

  openQuickAdd(type, editId) {
    const titles = { 
      category: editId ? '编辑分类' : '新建分类', 
      tag: editId ? '编辑标签' : '新建标签' 
    };
    document.getElementById('quick-add-title').textContent = titles[type] || '新建';
    document.getElementById('quick-add-submit').textContent = editId ? '保存' : '创建';
    document.getElementById('quick-add-error').style.display = 'none';
    document.getElementById('quick-add-modal').style.display = 'flex';
    this.setInert(document.getElementById('quick-add-modal'));
    this.state.quickAddType = type;
    this.state.quickAddEditId = editId || null;
    const colorGroup = document.getElementById('quick-add-color-group');
    const delBtn = document.getElementById('quick-add-delete');
    if (type === 'category') {
      colorGroup.style.display = 'block';
      delBtn.style.display = editId ? 'inline-block' : 'none';
    } else {
      colorGroup.style.display = 'none';
      delBtn.style.display = editId ? 'inline-block' : 'none';
    }
    let inputVal = '';
    let selectedColor = null;
    if (editId) {
      if (type === 'category') {
        const cat = this.state.categories.find(c => c.id === editId);
        inputVal = cat ? cat.name : '';
        selectedColor = cat ? cat.color : null;
      } else {
        const tag = this.state.tags.find(t => t.id === editId);
        inputVal = tag ? tag.name : '';
      }
    }
    document.getElementById('quick-add-input').value = inputVal;
    this.state.quickAddColor = selectedColor;
    this.renderColorPicker(selectedColor);
    setTimeout(() => {
      const inp = document.getElementById('quick-add-input');
      inp.focus();
      inp.select();
    }, 50);
  },

  renderColorPicker(selectedColor) {
    const dots = document.querySelectorAll('.color-option');
    dots.forEach(dot => {
      if (selectedColor && dot.dataset.color === selectedColor) {
        dot.classList.add('selected');
      } else {
        dot.classList.remove('selected');
      }
      dot.onclick = () => {
        dots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        this.state.quickAddColor = dot.dataset.color;
      };
    });
  },

  closeQuickAdd() {
    document.getElementById('quick-add-modal').style.display = 'none';
    this.state.quickAddType = null;
    this.state.quickAddEditId = null;
    this.state.quickAddColor = null;
    this.clearInert();
  },

  async saveQuickAdd(e) {
    e.preventDefault();
    const name = document.getElementById('quick-add-input').value.trim();
    const errEl = document.getElementById('quick-add-error');
    if (!name) {
      errEl.textContent = '名称不能为空';
      errEl.style.display = 'block';
      return;
    }
    const submitBtn = document.getElementById('quick-add-submit');
    const isEdit = !!this.state.quickAddEditId;
    const type = this.state.quickAddType;
    this.setBtnLoading(submitBtn, submitBtn.textContent);
    try {
      if (type === 'category') {
        if (isEdit) {
          await API.categories.update(this.state.quickAddEditId, name, this.state.quickAddColor);
          await this.loadCategories();
          await this.loadTodos();
        } else {
          await API.categories.create(name, this.state.quickAddColor);
          await this.loadCategories();
        }
      } else if (type === 'tag') {
        if (isEdit) {
          await API.tags.update(this.state.quickAddEditId, name);
          await this.loadTags();
          await this.loadTodos();
        } else {
          await API.tags.create(name);
          await this.loadTags();
        }
      }
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      this.clearBtnLoading(submitBtn);
      return;
    }
    this.clearBtnLoading(submitBtn);
    this.closeQuickAdd();
    if (type === 'category' && !isEdit) this.flashNew('#category-list .filter-item:last-child');
    if (type === 'tag' && !isEdit) this.flashNew('#tag-list .tag-item:last-child');
    var toastMsg = isEdit ? (type === 'category' ? '分类已更新' : '标签已更新') : (type === 'category' ? '分类已创建' : '标签已创建');
    this.showToast(toastMsg);
  },

  // ---- Toast Undo System ----
  showToast(message, actionLabel, actionCallback) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span>' + this.escape(message) + '</span>';
    if (actionLabel && actionCallback) {
      toast.innerHTML += '<button class="toast-undo-btn">' + actionLabel + '</button><div class="toast-timer"></div>';
    }
    container.appendChild(toast);
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 200);
    };
    if (actionLabel) {
      toast.querySelector('.toast-undo-btn').addEventListener('click', () => {
        if (!dismissed) { actionCallback(); dismiss(); }
      });
    }
    setTimeout(dismiss, 4000);
    return dismiss;
  },

  // ---- Inert helpers ----
  setInert(except) {
    document.querySelectorAll('.modal').forEach(m => {
      if (m !== except) m.setAttribute('inert', '');
    });
    document.getElementById('auth-page')?.setAttribute('inert', '');
    document.getElementById('app-page')?.setAttribute('inert', '');
  },
  clearInert() {
    document.querySelectorAll('[inert]').forEach(el => el.removeAttribute('inert'));
  },

  // ---- Flash animation for new items ----
  flashNew(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('new-flash');
      setTimeout(() => el.classList.remove('new-flash'), 600);
    }
  },

  // ---- Button loading state ----
  setBtnLoading(btn, text) {
    if (!btn) return;
    btn.dataset.originalText = btn.textContent;
    btn.classList.add('btn-loading');
    btn.textContent = text || '';
  },
  clearBtnLoading(btn) {
    if (!btn) return;
    btn.classList.remove('btn-loading');
    if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
  },

  escape(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  },

  priText(p) {
    return { high: '高优先级', medium: '中优先级', low: '低优先级' }[p] || p;
  },
  bindAppEvents() {
    const search = document.getElementById('search-input');
    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.state.filters.keyword = search.value;
        this.state.page = 1;
        this.loadTodos();
      }, 300);
    });
    document.getElementById('status-filter').addEventListener('change', e => {
      this.state.filters.status = e.target.value; this.state.page = 1; this.loadTodos();
    });
    document.getElementById('priority-filter').addEventListener('change', e => {
      this.state.filters.priority = e.target.value; this.state.page = 1; this.loadTodos();
    });
    document.getElementById('sort-select').addEventListener('change', e => {
      const parts = e.target.value.split(':');
      this.state.filters.sort_by = parts[0];
      this.state.filters.sort_order = parts[1];
      this.loadTodos();
    });
    document.getElementById('add-todo-btn').addEventListener('click', () => this.openModal());
    document.getElementById('todo-form').addEventListener('submit', e => this.saveTodo(e));
    document.getElementById('cancel-todo').addEventListener('click', () => this.closeModal());
    document.getElementById('confirm-ok').addEventListener('click', () => {
      if (this.state.confirmCallback) this.state.confirmCallback();
      this.closeConfirm();
    });
    document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirm());
    document.getElementById('add-category-btn').addEventListener('click', () => this.openQuickAdd('category'));
    document.getElementById('add-tag-btn').addEventListener('click', () => this.openQuickAdd('tag'));
    document.getElementById('quick-add-cancel').addEventListener('click', () => this.closeQuickAdd());
    document.getElementById('quick-add-form').addEventListener('submit', e => this.saveQuickAdd(e));
    document.getElementById('quick-add-input').addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeQuickAdd();
    });
    document.getElementById('quick-add-delete').addEventListener('click', async () => {
      const id = this.state.quickAddEditId;
      const type = this.state.quickAddType;
      if (!id) return;
      const item = type === 'category'
        ? this.state.categories.find(c => c.id === id)
        : this.state.tags.find(t => t.id === id);
      if (!item) return;
      this.closeQuickAdd();
      const itemCopy = { ...item };
      if (type === 'category') {
        await API.categories.remove(id);
        if (this.state.filters.category == id) this.state.filters.category = 'all';
        await this.loadCategories();
      } else {
        await API.tags.remove(id);
        if (this.state.filters.tag == id) this.state.filters.tag = 'all';
        await this.loadTags();
      }
      await this.loadTodos();
      var s=this; setTimeout(function(){s.showToast('已删除' + (type === 'category' ? '分类' : '标签') + '「' + itemCopy.name + '」', '撤销', async () => {
        if (type === 'category') {
          await API.categories.create(itemCopy.name, itemCopy.color);
          await s.loadCategories();
        } else {
          await API.tags.create(itemCopy.name);
          await s.loadTags();
        }
        await s.loadTodos();
        });}, 50);
    });
    // Click backdrop to close any modal
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          if (modal.id === 'quick-add-modal') this.closeQuickAdd();
          if (modal.id === 'todo-modal') this.closeModal();
          if (modal.id === 'confirm-modal') this.closeConfirm();
          if (modal.id === 'quick-add-modal') this.closeQuickAdd();
        }
      });
    });
    // Keyboard navigation for category and tag lists
    ['category-list', 'tag-list'].forEach(function(listId) {
      var list = document.getElementById(listId);
      list.addEventListener('keydown', function(e) {
        var items = Array.from(list.querySelectorAll('.filter-item, .tag-item'));
        var currentIdx = items.findIndex(function(item) { return item === document.activeElement; });
        if (currentIdx === -1) return;
        var nextIdx = currentIdx;
        if (e.key === 'ArrowDown') nextIdx = Math.min(currentIdx + 1, items.length - 1);
        else if (e.key === 'ArrowUp') nextIdx = Math.max(currentIdx - 1, 0);
        else return;
        e.preventDefault();
        items[nextIdx].focus();
        items[nextIdx].click();
      });
    });

    // Escape to close todo modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const todoModal = document.getElementById('todo-modal');
        if (todoModal.style.display !== 'none' && todoModal.style.display !== '') this.closeModal();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());