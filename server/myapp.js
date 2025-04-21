//create app
import express from 'express';
const app = express();

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

// Setup session middleware
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 1000 * 60 //1 hr
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
    res.render('mylogin');
})


//handle logging in
app.post('/login', verifyPassword, async(req, res)=>{
    const redirectPath = req.session.redirectTo || '/';
    delete req.session.redirectTo; // clean up after redirect
    /*req.session.save((err)=>{
        if (err){
            return res.status(500).json({ error: 'Failed to save session' });
        }
        res.redirect(redirectPath);
    });*/
    res.redirect(redirectPath);
});


app.get('/blog', (req, res)=>{
    res.render('index');
})


app.get( '/signup', (req, res)=>{
    res.render('signup');
})

//handle signup requests
app.post('/signup', signupValidator, async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

     // Continue to handle signup logic here
     const { firstname, surname, email, password } = req.body;
     try{
        const result = await addUser(firstname, surname, email, password);
        if (result == "user exists") {
            return res.status(400).json({message: 'Email already in use'});
        }
        res.status(201).json({ message: result });
     } catch(err) {
        res.status(500).json({message: 'something went wrong on the server'});
     }
})

//404 page
app.use( (req, res)=> {
    res.status(404).render("404");
})

//start the server
const port = process.env.DB_PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});
