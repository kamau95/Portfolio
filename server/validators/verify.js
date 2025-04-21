import bcrypt from 'bcrypt';
import {pool} from '../database.js'


//check if the password is correct
export const verifyPassword= async(req, res, next)=>{
    const {email, password}= req.body;
    if(!email || !password){
        return res.status(400).json({err: 'missing password or email'})
    }

    try{
        const [rows]= await pool.query('SELECT id, password FROM users WHERE email=?', [email]);

        if(rows.length === 0){
            return res.status(401).json({err: 'invalid password or email'});
        }

        const user= rows[0];  
        const match= await bcrypt.compare(password, user.password);

        if(!match){
            return res.status(401).json({err: 'invalid email or password'})
        }

        //create session
        req.session.userId= user.id;
        req.session.email= email;

        next();

    } catch(error){
        return res.status(500).json({err: 'internal server error'});
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
