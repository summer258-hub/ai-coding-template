// API 请求封装
const API = {
  baseURL: '/api',

  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  clearToken() {
    localStorage.removeItem('token');
  },

  async request(method, path, data) {
    const url = this.baseURL + path;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const token = this.getToken();
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const res = await fetch(url, options);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ? result.error.message : '请求失败');
      }
      return result.data;
    } catch (err) {
      if (err.message.includes('认证令牌') || err.message.includes('未提供认证')) {
        this.clearToken();
        window.location.reload();
      }
      throw err;
    }
  },

  // 认证
  auth: {
    register(username, email, password) {
      return API.request('POST', '/auth/register', { username, email, password });
    },
    login(username, password) {
      return API.request('POST', '/auth/login', { username, password });
    },
    me() {
      return API.request('GET', '/auth/me');
    }
  },

  // 分类
  categories: {
    list() { return API.request('GET', '/categories'); },
    create(name, color) { return API.request('POST', '/categories', { name, color }); },
    update(id, name, color) { return API.request('PUT', '/categories/' + id, { name, color }); },
    remove(id) { return API.request('DELETE', '/categories/' + id); }
  },

  // 标签
  tags: {
    list() { return API.request('GET', '/tags'); },
    create(name) { return API.request('POST', '/tags', { name }); },
    update(id, name) { return API.request('PUT', '/tags/' + id, { name }); },
    remove(id) { return API.request('DELETE', '/tags/' + id); }
  },

  // Todo
  todos: {
    list(params) {
      const query = new URLSearchParams(params).toString();
      return API.request('GET', '/todos?' + query);
    },
    get(id) { return API.request('GET', '/todos/' + id); },
    create(data) { return API.request('POST', '/todos', data); },
    update(id, data) { return API.request('PUT', '/todos/' + id, data); },
    updateStatus(id, status) { return API.request('PATCH', '/todos/' + id + '/status', { status }); },
    remove(id) { return API.request('DELETE', '/todos/' + id); }
  }
};