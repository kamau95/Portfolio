import bcrypt from 'bcrypt';
import {pool} from '../database.js'


//check if the password is correct
export const verifyPassword= async(req, res, next)=>{
    const {email, password}= req.body;
    if(!email || !password){
        //console.log('verifyPassword: Missing credentials');
        return res.render('mylogin', {
            err: 'Missing email or password',
            formData: req.body
        });
    }

    try{
        const [rows]= await pool.query('SELECT id, password FROM users WHERE email=?', [email]);
        //console.log('verifyPassword: Query result:', rows);

        if(rows.length === 0){
            //console.log('verifyPassword: User not found');
            return res.render('mylogin', {
                err: 'Invalid email or password',
                formData: req.body
            });
        }

        const user= rows[0];  
        const match= await bcrypt.compare(password, user.password);
        //console.log('verifyPassword: Password match:', match);

        if(!match){
            return res.render('mylogin', {
                err: 'Invalid email or password',
                formData: req.body
            });
        }

        //create session
        req.session.userId= user.id;
        req.session.email= email;

        next();

    } catch(error){
        return res.render('mylogin', {
            err: 'Internal server error',
            formData: req.body
        });
    }
}

//check if the user is authenticated
export const isAuthenticated= async(req, res, next)=>{
    if(req.session && req.session.userId){
        return next();
    }
    // Save original request path before redirecting
    req.session.redirectTo = req.originalUrl;

    res.redirect('/login');
}
