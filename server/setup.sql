/*form the db*/
CREATE DATABASE IF NOT EXISTS portfolio;
USE portfolio;

/*create table structures*/
CREATE TABLE if not exists users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(20),
    surname VARCHAR(20),
    email VARCHAR(40) UNIQUE,
    password VARCHAR(255)
);

/*fill the tables*/
INSERT INTO users(firstname, surname, email, password)  VALUES('cate', 'waruguru', 'waruguru23@gmail.com', 'cate@23')