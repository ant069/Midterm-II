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
let allHeroes = null;
let heroesById = null;

// Cache all heroes data
async function loadAllHeroes() {
  if (!allHeroes) {
    try {
      console.log('Fetching all heroes...');
      const response = await axios.get(`${API_BASE}/all.json`);
      allHeroes = response.data;
      // Create an index of heroes by ID
      heroesById = new Map(allHeroes.map(hero => [hero.id, hero]));
      console.log(`Loaded ${allHeroes.length} heroes`);
    } catch (error) {
      console.error('Error loading all heroes:', error);
      allHeroes = [];
      heroesById = new Map();
    }
  }
  return allHeroes;
}

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
    await loadAllHeroes(); // Ensure heroes are loaded
    
    let id = parseInt(req.params.id);
    let validIds = Array.from(heroesById.keys()).sort((a, b) => a - b);
    
    // Find the current index in our valid IDs array
    let currentIndex = validIds.indexOf(id);
    if (currentIndex === -1) {
      // If ID not found, default to first hero
      id = validIds[0];
      currentIndex = 0;
    }
    
    // Handle previous/next navigation
    if (req.query.direction === 'prev') {
      currentIndex = currentIndex <= 0 ? validIds.length - 1 : currentIndex - 1;
    } else if (req.query.direction === 'next') {
      currentIndex = currentIndex >= validIds.length - 1 ? 0 : currentIndex + 1;
    }
    
    id = validIds[currentIndex];
    const hero = heroesById.get(id);
    
    if (hero) {
      res.render('index', { 
        hero, 
        currentId: id, 
        totalHeroes: validIds.length,
        error: null 
      });
    } else {
      res.render('index', { 
        hero: null, 
        currentId: validIds[0], 
        totalHeroes: validIds.length,
        error: `Error loading hero data` 
      });
    }
  } catch (error) {
    console.error('Error loading hero:', error);
    res.render('index', { 
      hero: null, 
      currentId: id || 1, 
      totalHeroes: TOTAL_HEROES,
      error: 'Error loading hero' 
    });
  }
});

app.post('/search', async (req, res) => {
  try {
    const searchName = req.body.searchName.toLowerCase();
    const heroes = await loadAllHeroes();
    
    const found = heroes.find(hero => 
      hero.name.toLowerCase().includes(searchName) ||
      (hero.biography.fullName && hero.biography.fullName.toLowerCase().includes(searchName))
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
        error: `No hero found with name "${req.body.searchName}"` 
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