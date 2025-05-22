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
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    project_link VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    image2_url VARCHAR(255),
    image2_heading VARCHAR(100),
    image3_url VARCHAR(255),
    image3_heading VARCHAR(100),
    image4_url VARCHAR(255),
    image4_heading VARCHAR(100),
    technologies TEXT NOT NULL
);
