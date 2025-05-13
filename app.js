const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { message: 'Hello World' });
});
