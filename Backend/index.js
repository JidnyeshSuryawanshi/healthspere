const express = require('express')
const bcrypt = require('bcrypt') // For password hashing
const cors = require('cors') // For handling CORS
const app = express()
const port = 5000
const connection = require('./database'); 
const { generateToken } = require('./middleware/auth');

// Import routes
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

// Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Medical Clinic API is running')
})

app.get('/get-employee', (req,res)=>{
    const sql = "SELECT * from employee_info";
    connection.query(sql,(err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

// Use routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, userType, firstName, lastName, ...otherData } = req.body;
    
    // Check if user already exists
    const checkUserSql = `SELECT * FROM ${userType}s WHERE email = ?`;
    connection.query(checkUserSql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user based on userType
      let insertSql = '';
      let values = [];
      
      if (userType === 'patient') {
        const { dateOfBirth, gender, phone, address } = otherData;
        insertSql = `
          INSERT INTO patients 
          (email, password, first_name, last_name, date_of_birth, gender, phone, address) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [email, hashedPassword, firstName, lastName, dateOfBirth, gender, phone, address];
      } else if (userType === 'doctor') {
        const { specialization, licenseNumber, experience, qualifications } = otherData;
        insertSql = `
          INSERT INTO doctors 
          (email, password, first_name, last_name, specialization, license_number, experience, qualifications) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [email, hashedPassword, firstName, lastName, specialization, licenseNumber, experience, qualifications];
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
      
      connection.query(insertSql, values, (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(500).json({ message: 'Error registering user' });
        }
        
        res.status(201).json({ 
          message: 'Registration successful',
          userId: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    // Get user from database
    const sql = `SELECT * FROM ${userType}s WHERE email = ?`;
    connection.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      const user = results[0];
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Create user object to return (omit password)
      const userToReturn = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: userType
      };
      
      // Generate JWT token
      const token = generateToken(userToReturn);
      
      res.json({
        message: 'Login successful',
        user: userToReturn,
        token
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connection.connect((err)=>{
    if(err) throw err;
    console.log("Database connected");
  })
})