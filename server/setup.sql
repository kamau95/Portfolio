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

/*table to hold project details*/
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT
);
