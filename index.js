const express = require('express')
const session = require('express-session')
const nocache = require('nocache')
const config = require('./config/db')
const path = require('path')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
config.dbConnect()

// nocache
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

//for user routes
const userRoute = require('./routes/userRoute')

const adminRoute = require('./routes/adminRoute')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/', userRoute)
app.use('/admin',adminRoute)


app.use(session({
  secret: 'fhdsjfhdgbvmn',
  resave: false,
  saveUninitialized: true
}));


const PORT = process.env.PORT

app.listen(PORT, () => { console.log(`Server is running at http://localhost:${PORT}`) })