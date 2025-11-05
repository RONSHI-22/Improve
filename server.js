require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3019;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// --- Ensure upload directories exist ---
const uploadDirs = ['uploads/images', 'uploads/zips'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- Multer Storage ---
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/images'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const zipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/zips'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const imageUpload = multer({ storage: imageStorage });
const zipUpload = multer({ storage: zipStorage });

// --- Serve uploads folder ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => console.log('✅ Connected to MongoDB Atlas'));
db.on('error', (err) => console.error('❌ MongoDB error:', err));

// --- Schema ---
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
      downloadLink: String,
    },
  ],
});

const Content = mongoose.model('Content', contentSchema);

// --- Utility: Ensure a Content doc exists ---
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
app.post('/addPriest', imageUpload.single('image'), async (req, res) => {
  try {
    const data = await getOrCreateContent();
    const priest = {
      name: req.body.name,
      description: req.body.description,
      image: req.file ? `/uploads/images/${req.file.filename}` : '',
    };
    data.priests.push(priest);
    await data.save();
    res.json({ success: true, message: 'Priest added', priest });
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

// ---------- Sacraments / Games ----------
app.post('/addSacrament', imageUpload.single('image'), zipUpload.single('zipFile'), async (req, res) => {
  try {
    const data = await getOrCreateContent();
    const sacrament = {
      title: req.body.title,
      description: req.body.description,
      image: req.file ? `/uploads/images/${req.file.filename}` : '',
      downloadLink: req.files?.zipFile ? `/uploads/zips/${req.files.zipFile[0].filename}` : '',
    };
    data.sacraments.push(sacrament);
    await data.save();
    res.json({ success: true, message: 'Sacrament added', sacrament });
  } catch (err) {
    console.error(err);
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

// ---------- Serve HTML ----------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'FRONT.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'ADMIN', 'admin.html')));

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// ---------- Start server ----------
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
