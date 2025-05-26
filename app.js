const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Fonction pour vérifier un gagnant
function checkWinner(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
    [0, 4, 8], [2, 4, 6], // Diagonales
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // Retourne 'X' ou 'O'
    }
  }
  return null; // Pas de gagnant
}

const games = {};
let nextId = 1;

app.post('/api/games', (req, res) => {
  const id = nextId++;
  games[id] = {
    id,
    board: Array(9).fill(null),
    currentPlayer: 'X',
    isOver: false,
    winner: null,
  };
  res.status(201).json(games[id]);
});

app.put('/api/games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { cell, player } = req.body;

  const game = games[id];
  if (!game) return res.status(404).json({ error: 'Partie non trouvée' });
  if (game.isOver) return res.status(400).json({ error: 'Partie terminée' });
  if (typeof cell !== 'number' || cell < 0 || cell > 8) {
    return res.status(400).json({ error: 'Cellule invalide' });
  }
  if (game.board[cell]) {
    return res.status(400).json({ error: 'Case déjà jouée' });
  }
  if (player !== game.currentPlayer) {
    return res.status(400).json({ error: `Ce n'est pas le tour de ${player}` });
  }

  // Jouer le coup
  game.board[cell] = game.currentPlayer;

  // Vérifier un gagnant
  const winner = checkWinner(game.board);
  if (winner) {
    game.isOver = true;
    game.winner = winner;
  } else if (!game.board.includes(null)) {
    game.isOver = true; // Match nul
  } else {
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  }

  res.json(game);
});

app.get('/api/games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const game = games[id];
  if (!game) return res.status(404).json({ error: 'Partie non trouvée' });
  res.json(game);
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});