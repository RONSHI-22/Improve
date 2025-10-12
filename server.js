require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3019;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => console.log('✅ Connected to MongoDB Atlas'));
db.on('error', (err) => console.error('❌ MongoDB error:', err));

// Schema
const contentSchema = new mongoose.Schema({
  announcements: String,
  events: String,
  eventTextColor: String,
  eventImage: String,
  verse: String,
  verseName: String,
  priests: [
    {
      name: String,
      description: String,
      image: String,
    },
  ],
  sacraments: [
    {
      title: String,
      description: String,
      image: String,
    },
  ],
});

const Content = mongoose.model('Content', contentSchema);

// Utility: ensure a Content doc exists
async function getOrCreateContent() {
  let data = await Content.findOne();
  if (!data) {
    data = new Content();
    await data.save();
  }
  return data;
}

// ---------- General Content ----------
app.post('/saveContent', async (req, res) => {
  try {
    let data = await Content.findOne();
    if (!data) data = new Content(req.body);
    else Object.assign(data, req.body);
    await data.save();
    res.json({ success: true, message: 'Content saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/getContent', async (req, res) => {
  try {
    const data = await Content.findOne();
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Priests ----------
app.post('/addPriest', async (req, res) => {
  try {
    const data = await getOrCreateContent();
    data.priests.push(req.body);
    await data.save();
    res.json({ success: true, message: 'Priest added' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/getPriests', async (req, res) => {
  try {
    const data = await Content.findOne();
    res.json(data?.priests || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/getPriest/:id', async (req, res) => {
  try {
    const data = await Content.findOne();
    const priest = data?.priests.id(req.params.id);
    if (!priest) return res.status(404).json({ success: false, message: 'Priest not found' });
    res.json(priest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/updatePriest/:id', async (req, res) => {
  try {
    const data = await Content.findOne();
    const priest = data?.priests.id(req.params.id);
    if (!priest) return res.status(404).json({ success: false, message: 'Priest not found' });

    priest.name = req.body.name ?? priest.name;
    priest.description = req.body.description ?? priest.description;
    if (req.body.image) priest.image = req.body.image;

    await data.save();
    res.json({ success: true, message: 'Priest updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/deletePriest/:id', async (req, res) => {
  try {
    const data = await Content.findOne();
    data.priests = data.priests.filter((p) => p._id.toString() !== req.params.id);
    await data.save();
    res.json({ success: true, message: 'Priest deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Sacraments ----------
app.post('/addSacrament', async (req, res) => {
  try {
    const data = await getOrCreateContent();
    data.sacraments.push(req.body);
    await data.save();
    res.json({ success: true, message: 'Sacrament added' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/getSacraments', async (req, res) => {
  try {
    const data = await Content.findOne();
    res.json(data?.sacraments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/getSacrament/:id', async (req, res) => {
  try {
    const data = await Content.findOne();
    const s = data?.sacraments.id(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Sacrament not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/updateSacrament/:id', async (req, res) => {
  try {
    const data = await Content.findOne();
    const s = data?.sacraments.id(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Sacrament not found' });

    s.title = req.body.title ?? s.title;
    s.description = req.body.description ?? s.description;
    if (req.body.image) s.image = req.body.image;

    await data.save();
    res.json({ success: true, message: 'Sacrament updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/deleteSacrament/:id', async (req, res) => {
  try {
    const data = await Content.findOne();
    data.sacraments = data.sacraments.filter((s) => s._id.toString() !== req.params.id);
    await data.save();
    res.json({ success: true, message: 'Sacrament deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Static Routes ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FRONT.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'ADMIN', 'admin.html'));
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
