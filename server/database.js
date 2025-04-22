import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
//import fs from 'fs';

dotenv.config();

// Decode base64-encoded CA cert
const dec = Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf-8');

//db connection
export const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        ca: dec,
        rejectUnauthorized: true
    }
}).promise();

// Test pool connection
pool.getConnection()
    .then(conn => {
        console.log('MySQL pool connected successfully');  // ADDED: Debug connection
        conn.release();
    })
    .catch(err => console.error('MySQL pool connection error:', err));

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

        return { success: true, message: 'user added successfully'};
    } catch(err) {
        console.error('Error adding user:', err);
        throw new Error("Database error occurred");
    }
}




