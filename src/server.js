import express from 'express'
import cookieParser from 'cookie-parser'
import session from 'express-session';

const app = express();
const PORT = 8080;

app.use(cookieParser('Secreto!!!'))
app.use(session({
  secret: 'secretCoder',
  resave: true,
  saveUninitialized: true
}))

const auth = (req, res, next) => {
  if (req.session?.user === 'pepe' && req.session?.admin) {
    return next()
  }

  return res.status(401).send('error de autorizacion')
}

app.get('/setCookie', (req, res) => {
  res
    .cookie('CoderCookie', 'Esta es una cookie muy poderosa', {maxAge: 50000, signed: true})
    .send('Cookie')
})

app.get('/getCookies', (req, res) => {
  res.json({cookie: req.cookies, signedCookie: req.signedCookies});
})

app.get('/deleteCookie', (req, res) => {
  res.clearCookie('CoderCookie').send('Cookie removed')
})

app.get('/session', (req, res) => {
  if (req.session.counter) {
    req.session.counter++;
    res.send(`Se ha visitado el sitio ${req.session.counter} veces`);
  } else {
    req.session.counter = 1;
    res.send('Bienvenido')
  }
})

app.get('/logout', (req, res) => {
  // res.clearCookie('CoderCookie').send('Cookie removed')
  req.session.destroy(err => {
    if(!err) res.send('Logout ok')
    else res.send({status: 'Logout error', body: err})
  })
})

app.get('/login', (req, res) => {
  const {username, password} = req.query;

  if (username !== 'pepe' || password !== 'pepepass') {
    return res.send('login failed')
  }

  req.session.user = username;
  req.session.admin = true;

  // res.redirect('/privado')
  res.send('login success');
})

app.get('/privado', auth, (req, res) => {
  res.send('Si estas viendo esto es porque ya te logueaste')
})

app.get('/', (req, res) => {
  const {name} = req.query;

  if (req.session.visit) {
    req.session.visit++;

    if (req.session.name) {
      res.send(`${req.session.name} visitaste la pagina ${req.session.visit} veces`);
    } else {
      res.send(`Visitaste la pagina ${req.session.visit} veces`);
    }

  } else {
    req.session.visit = 1;

    if (name) {
      req.session.name = name;
      res.send(`Bienvenido ${name}`);
    } else {
      req.session.name = ''
      res.send('Te damos la bienvenida')
    }
  }
})

app.listen(PORT, () => console.log(`Server running in port ${PORT}`))