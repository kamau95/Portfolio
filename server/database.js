import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();
//db connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

export async function addUser(firstname, surname, email, password){
    try{
        const[existingUser] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
        if (existingUser.length > 0){
            return { success: false, message: 'User already exists' };
        }
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert new user into the database
        const [result] = await pool.query(
            'INSERT INTO users (firstname, surname, email, password) VALUES(?, ?, ?, ?)',
            [firstname, surname, email, hashedPassword]
        );

        return { success: true, message: 'user added sucessfully'};
    } catch(err) {
        console.error("error adding user", err.message);
        throw new Error("Database error occurred");
    }
}




