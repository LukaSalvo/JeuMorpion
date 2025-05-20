const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

let gameState = Array(9).fill(null); // Tableau 3x3 à plat
let currentPlayer = 'X';

app.get('/', (req, res) => {
  res.render('index', { gameState, currentPlayer });
});

app.post('/play', (req, res) => {
  const move = parseInt(req.body.cell);
  if (!isNaN(move) && !gameState[move]) {
    gameState[move] = currentPlayer;

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }

  res.redirect('/');
});

/**
 * TP 8 API
 */

const games = {};
let nextId = 1;


app.post("/api/games", (req, res ) => {
//Créer une partie
  const id = nextId++;
  games[id] = {
    id,
    board: Array(9).fill(null),
    currentPlayer: 'X',
    isOver : false
  };
  res.status(201).json(games[id]);
});

app.put("/api/games/:id", (req, res ) =>{
//Jouer un coup
  const id = parseInt(req.params.id);
  const cell = req.body.cell;

  const game = games[id];
  if (!game) return res.status(404).json({ error: 'Partie non trouvée' });
  if (game.isOver) return res.status(400).json({ error: 'Partie terminée' });
  if (typeof cell !== 'number' || cell < 0 || cell > 8) {
    return res.status(400).json({ error: 'Cellule invalide' });
  }
  if (game.board[cell]) {
    return res.status(400).json({ error: 'Case déjà jouée' });
  }

  game.board[cell] = game.currentPlayer;

  // Vérification basique : match nul uniquement
  if (!game.board.includes(null)) {
    game.isOver = true;
  } else {
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  }

  res.json(game);
});

app.get("/api/games/:id", (req, res ) =>{
//recuperer l'etat d'une partie
  const id = parseInt(req.params.id);
  const game = games[id];
  if (!game) return res.status(404).json({ error: 'Partie non trouvée' });
  res.json(game);
});


app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

