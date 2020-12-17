DROP DATABASE IF EXISTS firm_DB;
CREATE database firm_DB;

USE firm_DB;

CREATE TABLE department (
  id int NOT NULL AUTO_INCREMENT,
  name VARCHAR(30),
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id int NOT NULL AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL, 
  PRIMARY KEY (id)
);

CREATE TABLE employee (
  id int NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT NOT NULL,
  isManager BOOLEAN NOT NULL,
  superviserORmanager_id INT,
  PRIMARY KEY (id)
);