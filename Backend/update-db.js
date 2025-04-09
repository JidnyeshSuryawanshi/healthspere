const connection = require('./database');

// Connect to database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  
  console.log('Connected to database');
  
  // Check if patient_id column exists in prescriptions
  const checkPatientIdSql = "SHOW COLUMNS FROM prescriptions LIKE 'patient_id'";
  
  connection.query(checkPatientIdSql, (err, results) => {
    if (err) {
      console.error('Error checking columns:', err);
      connection.end();
      process.exit(1);
    }
    
    // If patient_id doesn't exist, add it
    if (results.length === 0) {
      const addPatientIdSql = "ALTER TABLE prescriptions ADD COLUMN patient_id INT, ADD FOREIGN KEY (patient_id) REFERENCES patients(id)";
      connection.query(addPatientIdSql, (err) => {
        if (err) {
          console.error('Error adding patient_id column:', err);
        } else {
          console.log('Added patient_id column to prescriptions table');
        }
      });
    }
    
    // Check if doctor_id column exists
    connection.query("SHOW COLUMNS FROM prescriptions LIKE 'doctor_id'", (err, results) => {
      if (err) {
        console.error('Error checking columns:', err);
        connection.end();
        return;
      }
      
      // If doctor_id doesn't exist, add it
      if (results.length === 0) {
        connection.query("ALTER TABLE prescriptions ADD COLUMN doctor_id INT, ADD FOREIGN KEY (doctor_id) REFERENCES doctors(id)", (err) => {
          if (err) {
            console.error('Error adding doctor_id column:', err);
          } else {
            console.log('Added doctor_id column to prescriptions table');
          }
        });
      }
      
      // Check if notes column exists
      connection.query("SHOW COLUMNS FROM prescriptions LIKE 'notes'", (err, results) => {
        if (err) {
          console.error('Error checking columns:', err);
          connection.end();
          return;
        }
        
        // If notes doesn't exist, add it
        if (results.length === 0) {
          connection.query("ALTER TABLE prescriptions ADD COLUMN notes TEXT", (err) => {
            if (err) {
              console.error('Error adding notes column:', err);
            } else {
              console.log('Added notes column to prescriptions table');
            }
          });
        }
        
        // Now check prescription_medications table structure
        connection.query("SHOW COLUMNS FROM prescription_medications LIKE 'medication_name'", (err, results) => {
          if (err) {
            console.error('Error checking medication columns:', err);
            connection.end();
            return;
          }
          
          // If medication_name exists, rename it to name
          if (results.length > 0) {
            connection.query("ALTER TABLE prescription_medications CHANGE COLUMN medication_name name VARCHAR(100) NOT NULL", (err) => {
              if (err) {
                console.error('Error renaming medication_name column:', err);
              } else {
                console.log('Renamed medication_name to name in prescription_medications table');
              }
            });
          }
          
          // Make frequency nullable if it exists
          connection.query("SHOW COLUMNS FROM prescription_medications LIKE 'frequency'", (err, results) => {
            if (err) {
              console.error('Error checking frequency column:', err);
              connection.end();
              return;
            }
            
            if (results.length > 0 && results[0].Null === 'NO') {
              connection.query("ALTER TABLE prescription_medications MODIFY COLUMN frequency VARCHAR(50) NULL", (err) => {
                if (err) {
                  console.error('Error modifying frequency column:', err);
                } else {
                  console.log('Made frequency column nullable in prescription_medications table');
                }
              });
            }
            
            // Make duration nullable if it exists
            connection.query("SHOW COLUMNS FROM prescription_medications LIKE 'duration'", (err, results) => {
              if (err) {
                console.error('Error checking duration column:', err);
              } else if (results.length > 0 && results[0].Null === 'NO') {
                connection.query("ALTER TABLE prescription_medications MODIFY COLUMN duration VARCHAR(50) NULL", (err) => {
                  if (err) {
                    console.error('Error modifying duration column:', err);
                  } else {
                    console.log('Made duration column nullable in prescription_medications table');
                  }
                });
              }
              
              // Check if notes column exists in prescription_medications
              connection.query("SHOW COLUMNS FROM prescription_medications LIKE 'notes'", (err, results) => {
                if (err) {
                  console.error('Error checking medication notes column:', err);
                } else if (results.length > 0) {
                  connection.query("ALTER TABLE prescription_medications DROP COLUMN notes", (err) => {
                    if (err) {
                      console.error('Error dropping notes column from prescription_medications:', err);
                    } else {
                      console.log('Dropped notes column from prescription_medications table');
                    }
                  });
                }
                
                console.log('Database update complete');
                connection.end();
              });
            });
          });
        });
      });
    });
  });
}); 