const express = require('express');
const debug = require('debug')('app');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4000;
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'books-info'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '/public/')));

app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));

app.set('views', './src/views');
app.set('view engine', 'ejs');

connection.connect((err) => {
  if (err) throw err;
  debug('Connected!');
});

const SELECT_ALL_SEARCHES_QUERY = 'SELECT * FROM searches ORDER BY insertTime DESC';

let searches = [];

app.get('/', (req, res) => {
  connection.query(SELECT_ALL_SEARCHES_QUERY, (err, results) => {
    if (err) {
      debug(err);
      return err;
    }
    searches = results.map(element => element.search);
    const last10 = searches.slice(0, 10);
    const most3 = searches.slice(0, 3);
    const review = '';
    const name = '';
    res.render('index', {
      title: 'Books-Info', name, review, last10, most3
    });
    return results;
  });
});

app.post('/', (req, res) => {
  const name = req.body.bookName;
  const insertTime = new Date().getTime();
  const INSERT_SEARCH_QUERY = `INSERT INTO searches (search, insertTime) VALUES('${name}', ${insertTime})`;
  connection.query(INSERT_SEARCH_QUERY, (err, results) => {
    if (err) {
      debug(err);
      return err;
    }
    searches = [name, ...searches];
    const last10 = searches.slice(0, 10);
    const most3 = searches.slice(0, 3);
    const review = "The Jungle Book: Mowgli's Adventures adapts Rudyard Kipling's timeless tale of a young boy lost in the jungles of India for young children. This delightfully written and illustrated book focuses on the magic of the jungle and the one-of-a-kind characters and fantastical situations that Mowgli finds himself in.";
    res.render('index', {
      title: 'Books-Info', name, review, last10, most3
    });
    return results;
  });
});

app.get('/:name', (req, res) => {
  const { name } = req.params;
  const last10 = searches.slice(0, 10);
  const most3 = searches.slice(0, 3);
  const review = "The Jungle Book: Mowgli's Adventures adapts Rudyard Kipling's timeless tale of a young boy lost in the jungles of India for young children. This delightfully written and illustrated book focuses on the magic of the jungle and the one-of-a-kind characters and fantastical situations that Mowgli finds himself in.";
  res.render('fullInfo', {
    title: 'Books-Info', review, name, last10, most3
  });
});

app.listen(port, () => {
  debug(`listening on port ${port}`);
});
