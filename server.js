const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const API_BASE = 'https://akabab.github.io/superhero-api/api';
const TOTAL_HEROES = 731;

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/id/1.json`);
    res.render('index', { 
      hero: response.data, 
      currentId: 1, 
      totalHeroes: TOTAL_HEROES,
      error: null 
    });
  } catch (error) {
    res.render('index', { 
      hero: null, 
      currentId: 1, 
      totalHeroes: TOTAL_HEROES,
      error: 'Error loading hero' 
    });
  }
});

app.get('/hero/:id', async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    
    if (id < 1) id = TOTAL_HEROES;
    if (id > TOTAL_HEROES) id = 1;
    
    const response = await axios.get(`${API_BASE}/id/${id}.json`);
    res.render('index', { 
      hero: response.data, 
      currentId: id, 
      totalHeroes: TOTAL_HEROES,
      error: null 
    });
  } catch (error) {
    res.render('index', { 
      hero: null, 
      currentId: 1, 
      totalHeroes: TOTAL_HEROES,
      error: 'Error loading hero' 
    });
  }
});

app.post('/search', async (req, res) => {
  try {
    const searchName = req.body.searchName;
    const response = await axios.get(`${API_BASE}/all.json`);
    const heroes = response.data;
    
    const found = heroes.find(hero => 
      hero.name.toLowerCase().includes(searchName.toLowerCase())
    );
    
    if (found) {
      res.render('index', { 
        hero: found, 
        currentId: found.id, 
        totalHeroes: TOTAL_HEROES,
        error: null 
      });
    } else {
      res.render('index', { 
        hero: null, 
        currentId: 1, 
        totalHeroes: TOTAL_HEROES,
        error: `No hero found with name "${searchName}"` 
      });
    }
  } catch (error) {
    res.render('index', { 
      hero: null, 
      currentId: 1, 
      totalHeroes: TOTAL_HEROES,
      error: 'Error searching hero' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});