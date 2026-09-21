const express = require('express');
const path = require('path');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const todoRoutes = require('./routes/todos');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/todos', todoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;