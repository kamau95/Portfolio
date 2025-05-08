import express from 'express';
import {pool, addUser } from './database.js';
import session from 'express-session';
import dotenv from 'dotenv';
import MySQLSession from 'express-mysql-session';
import {router} from './routes/projectCreation.js'//mount the router in the app

//load env variables
dotenv.config();
// Decode base64 string to PEM
const decodedCa = Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf-8');

//create app
const app = express();
app.use('/projects', router);

//set environment
app.set('env', process.env.NODE_ENV || 'development');
//check if in production
if(app.get('env') === 'production'){
    app.set('trust proxy', 1);//for services like render
};

// Handle pool errors
pool.on('error', err => {
    console.error('MySQL pool error:', err);
});

// Test database connection
try {
    await pool.query('SELECT 1');
    console.log('Database connection OK');
} catch (err) {
    console.error('Database test query failed:', err);
    process.exit(1); // Exit if connection fails (optional, based on your needs)
}

//create session store
const MySQLStore= MySQLSession(session);
export let sessionStore;
try{
    sessionStore= new MySQLStore({
        clearExpired: true,
        expiration: 1000*60*20, // expire after 20 mins
        checkExpirationInterval: 1000*60, // Clean up every 1 min
        createDatabaseTable: true,

    }, pool);
    console.log('connected to mysqlsessionstore successfully')
}catch(err){
    console.error('Error initializing MySQL session store:', err.message);
    process.exit(1);
}

//session configuration
const sess= {
    store: sessionStore,
    resave: false,
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    saveUninitialized: true,//save all new sess even if empty
    cookie: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000*60*20, //20 mins
    }
}

app.use(session(sess));


// CHANGE: Added request logging middleware to trace all incoming requests
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});


//deal with input validation
import {validationResult} from 'express-validator';
import {signupValidator} from './validators/inputValidator.js';
import {verifyPassword, isAuthenticated} from './validators/verify.js';

//enable pass data from a form and json requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//register a view
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static files from the 'public' directory
app.use(express.static('public'));


//handler routes
app.get('/', (req, res)=>{
    res.render("index");
});


app.get('/about', isAuthenticated, (req, res)=>{
    res.render('about');
})


app.get('/login', (req, res)=>{
    delete req.session.redirectTo;
    res.render('mylogin', { err: null, formData: {} });
})


app.post('/login', verifyPassword, async (req, res) => {
    try {
        const redirectPath = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        res.json({ success: true, redirect: redirectPath });
    } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({
            errors: [],
            message: 'Internal server error',
            formData: req.body
        });
    }
});


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
        return res.status(400).json({
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
            return res.status(400).json({
                errors: [],
                message: result.message,
                formData: req.body
            });
        }
        res.json({ success: true, redirect: '/login'}); // Redirect to login on success
    } catch(err) {
        console.error('Signup error:', err);
        res.status(500).json({
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
const port = process.env.PORT;
const host = process.env.HOST;
app.listen(port, host, ()=>{
    console.log(`Server running on http://${host}:${port}`);
});
