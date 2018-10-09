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

app.get('/', (req, res) => {
  res.render('index', { title: 'Books-Info' });
});

app.listen(port, () => {
  debug(`listening on port ${port}`);
});
