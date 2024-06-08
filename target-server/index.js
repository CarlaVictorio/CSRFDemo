const express = require('express');
const session = require('express-session');
const flash = require('connect-flash-plus');
const handlebars = require('express-handlebars');
const { v4: uuid } = require('uuid');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middlwares

// app.use(cors({
//   origin: 'http://localhost:5000',
//   credentials: true,
// }));

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());
app.set("views", __dirname);
app.engine("hbs", handlebars({
  defaultLayout: 'main',
  layoutsDir: __dirname,
  extname: '.hbs',
}));
app.set("view engine", "hbs");

// Login

const login = (req, res, next) => {
  if (!req.session.userId) {
    //Si no estas autenticado
    res.redirect('/login');
  } else {
    //Si estas autenticado, siguiente middleware
    next();
  }
}

// CSRF

// const tokens = new Map();

//Asociamos token a la sessionID
// const csrfToken = (sessionId) => {
//   const token = uuid();
//   const userTokens = tokens.get(sessionId);
//   userTokens.add(token);
//   setTimeout(() => userTokens.delete(token), 30000);

//   return token;
// }

//Middleware para la comprobacion
// const csrf = (req, res, next) => {
//   const token = req.body.csrf;
//   if (!token || !tokens.get(req.sessionID).has(token)) {
//     res.status(422).send('CSRF Token missing or expired');
//   } else {
//     next();
//   }
// }

// Db

const users = JSON.parse(fs.readFileSync('db.json'));

// Routes

// app.get('/home', login, (req, res) => {
//   res.send('Home page, must be logged in to access');
// });

app.get('/home', login, (req, res) => {
  res.render('home', { message: req.flash('message') });
});

app.get('/login', (req, res) => {
  console.log(req.session);
  res.render('login', { message: req.flash('message') });
});

app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    req.flash('message', 'Fill all the fields');
    return res.redirect('/login');
  }
  const user = users.find(user => user.email === req.body.email);
  //Si no se encuentra al usuario o no coincide, retornamos error
  if (!user || user.password !== req.body.password) {
    req.flash('message', 'Invalid credentials');
    return res.redirect('/login');
  }
  req.session.userId = user.id;
  //tokens.set(req.sessionID, new Set());
  console.log(req.session);
  req.flash('message', 'You have logged in correctly');
  res.redirect('/home');
});

app.get('/logout', login, (req, res) => {
  req.session.destroy();
  return res.redirect('/login');
})

app.get('/edit', login, (req, res) => {
  //Ruta protegida con el middleware del login
  //res.render('edit', { token: csrfToken(req.sessionID) });
  res.render('edit', { message: req.flash('message') });
});

app.post('/edit', login, /*csrf,*/ (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  
  if (!req.body.email || req.body.email.trim() === '') {
    req.flash('message', 'Introduce a valid email');
    return res.redirect('/edit');
  } else {

  user.email = req.body.email;
  console.log(`User ${user.id} email changed to ${user.email}`);
  // fs.writeFileSync('db.json', JSON.stringify(users));
  new_email = user.email
  req.flash('message', 'Email changed to ' + new_email);
  return res.redirect('/home');
  }

});


// Server

app.listen(PORT, () => console.log('Listening on port', PORT));
