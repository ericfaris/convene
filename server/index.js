const express = require('express');
const path = require('path');
const connectDB = require('./db');

const app = express();
app.use(express.json());

connectDB();

app.use('/api/events', require('./routes/events'));
app.use('/api/events', require('./routes/responses'));

// Serve React app for all non-API routes
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Convene running on port ${PORT}`));
