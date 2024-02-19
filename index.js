const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://localhost/url_shortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String
  });
  
  const Url = mongoose.model('Url', urlSchema);




  app.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
  
    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  
    const url = await Url.findOne({ originalUrl });
  
    if (url) {
      res.json(url);
    } else {
      const shortCode = shortid.generate();
      const shortUrl = `http://localhost:3000/${shortCode}`;
  
      const newUrl = new Url({
        originalUrl,
        shortUrl
      });
  
      await newUrl.save();
      res.json(newUrl);
    }
  });
  
  app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
  
    const url = await Url.findOne({ shortUrl: `http://localhost:3000/${shortCode}` });
  
    if (url) {
      res.redirect(url.originalUrl);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  });

  
  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
