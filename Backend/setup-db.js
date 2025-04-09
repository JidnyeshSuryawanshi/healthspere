const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create connection to the employees database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Khushbu@123',
  database: 'employees',
  multipleStatements: true // Allow multiple statements
});

// Read the SQL file
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('Starting database setup...');
console.log('Creating tables in employees database...');

// Execute the SQL to create tables
connection.query(schemaSql, (err, results) => {
  if (err) {
    console.error('Error setting up database:', err);
    connection.end();
    return;
  }
  
  console.log('Tables created successfully!');
  connection.end();
}); 