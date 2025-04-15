CREATE TABLE users if not exists(
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(20),
    surname VARCHAR(20),
    email VARCHAR(40) UNIQUE,
    password VARCHAR(255)
);