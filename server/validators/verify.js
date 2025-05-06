import bcrypt from 'bcrypt';
import {pool} from '../database.js'


//check if the password is correct
export const verifyPassword= async(req, res, next)=>{
    const {email, password}= req.body;
    if(!email || !password){
        return res.status(400).json({
            errors: [],
            message: 'Missing email or password',
            formData: req.body
        })
    }

    try{
        const emailLower = email.toLowerCase();
        const [rows]= await pool.query('SELECT id, password FROM users WHERE email=?', [emailLower]);

        if(rows.length === 0){
            return res.status(400).json({
                errors: [],
                message: 'something is wrong',
                formData: req.body
            });
        }

        const user= rows[0];  
        const match= await bcrypt.compare(password, user.password);

        if(!match){
            return res.status(400).json({
                errors: [],
                message: 'Invalid email or password',
                formData: req.body
            });
        }

        //create session
        req.session.userId= user.id;
        req.session.email= email;

        next();

    } catch(error){
        console.error('Verify password error:', error);
        return res.status(500).json({
            errors: [],
            message: "caused by internal server error",
            formData: req.body,
        });
    }
}

//check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }

    // Save original request path before redirecting
    req.session.redirectTo = req.originalUrl;

    // Check if the request expects JSON (API request)
    if (req.is('json') || req.get('Accept').includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized. Please log in.',
            redirect: '/login'
        });
    }

    // For non-JSON requests (e.g., browser navigating to /about), redirect to login
    return res.redirect('/login');
};
