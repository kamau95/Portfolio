
import express from 'express';
import Sequelize from 'sequelize';
import connectSessionSequelize from 'connect-session-sequelize';

//create app
const app = express();

// Decode base64 string to PEM
const decodedCa = Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf-8');


import { addUser } from './database.js';
import session from 'express-session';

//deal with input validation
import {validationResult} from 'express-validator';
import {signupValidator} from './validators/useValidator.js';
import {verifyPassword, isAuthenticated} from './validators/verify.js';

//enable pass data from a form and json requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//register a view
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static files from the 'public' directory
app.use(express.static('public'));


//Sequelize setup for MySQL session store
const sequelize = new Sequelize(
    process.env.DB_NAME || 'your_db_name',  // Read from .env or fallback to default values
    process.env.DB_USER || 'your_db_user',
    process.env.DB_PASSWORD || 'your_password',
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
          ssl: {
            ca: decodedCa,
            rejectUnauthorized: true
          }
        },
        logging: false,
      }
    );

// Test Sequelize connection
sequelize.authenticate()
  .then(() => console.log('Sequelize connected successfully'))
  .catch(err => console.error('Sequelize connection error:', err));

//Initialize session store with Sequelize
const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
});

//Create sessions table if it doesn't exist
sessionStore.sync()
.then(() => console.log('Session store synced'))
.catch(err => console.error('Session store sync error:', err));

//Setup session middleware to use Sequelize store
app.use(session({
    secret: process.env.SECRET || 'mysecret',
    store: sessionStore, // ✅ use the Sequelize store
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  }));


//handler routes
app.get('/', (req, res)=>{
    res.render("index");
});


app.get('/about', isAuthenticated, (req, res)=>{
    res.render('about');
})


app.get('/login', (req, res)=>{
    delete req.session.redirectTo;//solves the issue of race condition where saving session changes failed
    res.render('mylogin', { err: null, formData: {} });
})


//handle logging in
/*app.post('/login', verifyPassword, async(req, res)=>{
    const redirectPath = req.session.redirectTo || '/';
    delete req.session.redirectTo; // clean up after redirect
    /*req.session.save((err)=>{
        if (err){
            return res.status(500).json({ error: 'Failed to save session' });
        }
        res.redirect(redirectPath);
    });*/
    /*res.redirect(redirectPath);
});
*/
app.post('/login', verifyPassword, async (req, res) => {
    try {
        const redirectPath = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        console.log('Login: Redirecting to:', redirectPath);  // ADDED: Debug logging
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });  // ADDED: Ensure session save before redirect
        res.redirect(redirectPath);
    } catch (error) {
        console.error('Login route error:', error);  // ADDED: Error logging
        res.render('mylogin', {
            err: 'Internal server error',
            formData: req.body
        });
    }
})


app.get('/blog', (req, res)=>{
    res.render('index');
})


app.get( '/signup', (req, res)=>{
    res.render('signup', { errors: [], message: null, formData: {} });
})

//handle signup requests
app.post('/signup', signupValidator, async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render('signup', {
            errors: errors.array(),
            message: null,
            formData: req.body // Preserve form inputs
        });
    }

     // Continue to handle signup logic here
     const { firstname, surname, email, password } = req.body;
     try{
        const result = await addUser(firstname, surname, email, password);
        if (!result.success){
            return res.render('signup', {
                errors: [],
                message: result.message,
                formData: req.body
            });
        }
        res.redirect('/login'); // Redirect to login on success
     } catch(err) {
        console.error('Signup error:', err);
        res.render('signup', {
            errors: [],
            message: 'Something went wrong on the server',
            formData: req.body
        });
     }
})

//404 page
app.use( (req, res)=> {
    res.status(404).render("404");
})

//start the server
const port = process.env.PORT || 3001;
const host = '0.0.0.0';
app.listen(port, host, ()=>{
    console.log(`Server running on http://${host}: ${port}`);
});
