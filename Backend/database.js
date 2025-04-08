const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: 'localhost',
    database:'employees',
    user:'root',
    password:'Khushbu@123'
})

module.exports = connection;