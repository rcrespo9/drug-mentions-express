const express = require('express');
const fetch = require('isomorphic-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// const corsWhitelist = [];
// const corsOptions = {
//   origin(origin, callback) {
//     if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

app.use(cors());

const geniusApiUrl = 'https://api.genius.com';
const fetchHeaders = {
  headers: {
    Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`,
  },
};

app.get('/', (req, res) => res.send('Welcome to the Drug Mentions API!'));

app.get('/search', async (req, res) => {
  const { q } = req.query;

  try {
    const response = await fetch(`${geniusApiUrl}/search?q=${q}`, fetchHeaders);
    const searchResults = await response.json();
    const songsOnly = searchResults.response.hits.filter((hit) => hit.type === 'song');

    res.json(songsOnly);
  } catch (error) {
    throw new Error(error);
  }
});

app.get('/song-lyrics/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const songRes = await fetch(`${geniusApiUrl}/songs/${id}`, fetchHeaders);
    const songJson = await songRes.json();
    const {
      response: { song },
    } = songJson;

    const songPage = await fetch(`${song.url}`);
    const songPageHTML = await songPage.text();

    const $ = cheerio.load(songPageHTML);
    const lyrics = $('.lyrics').text();

    res.json({ title: song.full_title, lyrics });
  } catch (error) {
    throw new Error(error);
  }
});

app.listen(process.env.PORT || port, () => console.log(`App listening on port ${process.env.PORT || port}`));
