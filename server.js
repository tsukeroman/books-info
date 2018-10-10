const express = require('express');
const debug = require('debug')('app');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '/public/')));

app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));

app.set('views', './src/views');
app.set('view engine', 'ejs');

const review = "The Jungle Book: Mowgli's Adventures adapts Rudyard Kipling's timeless tale of a young boy lost in the jungles of India for young children. This delightfully written and illustrated book focuses on the magic of the jungle and the one-of-a-kind characters and fantastical situations that Mowgli finds himself in.";

const last10 = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eightth', 'nineth', 'tenth'];

const most3 = ['first', 'second', 'third'];

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Books-Info', review, last10, most3
  });
});

app.get('/:id', (req, res) => {
  const { id } = req.params;
  // res.send(`sent ${id}`);
  res.render('fullInfo', {
    title: 'Books-Info', review, id, last10, most3
  });
});

app.listen(port, () => {
  debug(`listening on port ${port}`);
});
