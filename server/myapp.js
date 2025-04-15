import express from 'express';
const app = express();

//register a view
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static files from the 'public' directory
app.use(express.static('public'));

//handle routes
app.get('/', (req, res)=>{
    res.render("index");
});
app.get('/about', (req, res)=>{
    res.render('about');
})
app.get('/login', (req, res)=>{
    res.render('mylogin');
})
app.get('/blog', (req, res)=>{
    res.render('index');
})
app.get( '/signup', (req, res)=>{
    res.render('signup');
})

//404 page
app.use( (req, res)=> {
    res.status(404).render("404");
})

app.listen(3000);