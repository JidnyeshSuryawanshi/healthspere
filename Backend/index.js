const express = require('express')
const app = express()
const port = 3000
const connection = require('./database'); 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/get-employee', (req,res)=>{
    const sql = "SELECT * from employee_info";
    connection.query(sql,(err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connection.connect((err)=>{
    if(err) throw err;
    console.log("Database connected");
  })
})