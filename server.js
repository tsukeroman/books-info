const express = require('express');
const debug = require('debug')('app');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port = process.env.PORT || 4000;
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'books-info'
});
const parser = xml2js.Parser({ explicitArray: false });

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

function getBookByTitle(title) {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.goodreads.com/book/title.xml?&key=9hoCiTrsCBET1EZFyF6F6g&title=${title}`)
      .then((response) => {
        parser.parseString(response.data, (err, result) => {
          if (err) {
            debug(err);
          } else {
            resolve(result.GoodreadsResponse.book);
          }
        });
      })
      .catch((error) => {
        // reject(error);
        // process.on('unhandledRejection', (up) => { throw up; });
        debug(error.info);
        resolve(null);
      });
  });
}

function largerImage(url) {
  const prefixLen = 'https://images.gr-assets.com/books/1474154022'.length;
  const res = `${url.substring(0, prefixLen)}l${url.substring(prefixLen + 1)}`;
  return res;
}

/*
To prevent any kind of "sql-injection" alike attacks, I block input with special
characters, e.g. the server would not proceeded any harmful inputs to the
database and cause troubles.
*/
function validateInput(str) {
  const Restricted = '"\'`*+=/|';
  let i;
  for (i = 0; i < Restricted.length; i += 1) {
    if (str.indexOf(Restricted[i]) !== -1) {
      return false;
    }
  }
  return true;
}

function mostSearched(lastSearches, mostNum) {
  const dict = {};
  for (let i = 0; i < lastSearches.length; i += 1) {
    if (lastSearches[i] in dict) {
      dict[lastSearches[i]] += 1;
    } else {
      dict[lastSearches[i]] = 1;
    }
  }
  const items = Object.keys(dict).map(key => [key, dict[key]]);
  items.sort((first, second) => second[1] - first[1]);
  const results = items.map(val => val[0]);
  return results.slice(0, mostNum);
}

const SELECT_200_LAST_SEARCHES_QUERY = 'SELECT * FROM searches ORDER BY insertTime DESC LIMIT 200';

let searches = [];

app.get('/', (req, res) => {
  connection.query(SELECT_200_LAST_SEARCHES_QUERY, (err, results) => {
    if (err) {
      debug(err);
      return err;
    }
    searches = results.map(element => element.search);
    const last10 = searches.slice(0, 10);
    const most3 = mostSearched(searches, 3);
    const review = '';
    const name = '';
    res.render('index', {
      title: 'Books-Info', name, review, last10, most3
    });
    return results;
  });
});

app.post('/', async (req, res) => {
  let name = req.body.bookName;
  let last10 = searches.slice(0, 10);
  let most3 = mostSearched(searches, 3);
  if (validateInput(name) === false) {
    const errorMSG = `Sorry, there are no results for "${name}".`;
    res.render('errorHandle', {
      title: 'Books-Info', errorMSG, last10, most3
    });
  } else {
    const book = await getBookByTitle(name);
    let review;
    if (book === null) {
      const errorMSG = `Sorry, there are no results for "${name}".`;
      res.render('errorHandle', {
        title: 'Books-Info', errorMSG, last10, most3
      });
    } else {
      const insertTime = new Date().getTime();
      const INSERT_SEARCH_QUERY = `INSERT INTO searches (search, insertTime) VALUES('${book.title}', ${insertTime})`;
      await connection.query(INSERT_SEARCH_QUERY, (err, results) => {
        if (err) {
          debug(err);
          return err;
        }
        return results;
      });
      searches = [book.title, ...searches];
      last10 = searches.slice(0, 10);
      most3 = mostSearched(searches, 3);
      review = book.description;
      if (review === '') {
        review = 'There is no available description for this book.';
      }
      name = book.title;
      res.render('index', {
        title: 'Books-Info', name, review, last10, most3
      });
    }
  }
});

app.get('/books/:name', async (req, res) => {
  let { name } = req.params;
  const last10 = searches.slice(0, 10);
  const most3 = mostSearched(searches, 3);
  const book = await getBookByTitle(name);
  let review;
  let img;
  if (book === null) {
    const errorMSG = `Sorry, there are no results for "${name}".`;
    res.render('errorHandle', {
      title: 'Books-Info', errorMSG, last10, most3
    });
  } else {
    debug(book.authors);
    let author;
    if (book.authors.author.constructor === Array) {
      author = book.authors.author[0].name;
    } else {
      author = book.authors.author.name;
    }
    const { isbn } = book;
    const count = book.work.books_count._;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = book.work.original_publication_month._;
    const year = book.work.original_publication_year._;
    const day = book.work.original_publication_day._;
    const date = `${months[month - 1]} ${day}th ${year}`;
    debug(date);
    review = book.description;
    if (review === '') {
      review = 'There is no available description for this book.';
    }
    name = book.title;
    img = largerImage(book.image_url);
    res.render('fullInfo', {
      title: 'Books-Info', author, isbn, count, date, review, name, img, last10, most3
    });
  }
});

app.get('*', (req, res) => {
  // const name = req.url;
  const last10 = searches.slice(0, 10);
  const most3 = mostSearched(searches, 3);
  const errorMSG = 'The page you are trying to reach does not exist.';
  res.render('errorHandle', {
    title: 'Books-Info', errorMSG, last10, most3
  });
});

app.listen(port, () => {
  debug(`listening on port ${port}`);
});
