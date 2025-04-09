const connection = require('../database');

// Create a new prescription
exports.createPrescription = (req, res) => {
  const doctorId = req.user.id;
  const { patientId, appointmentId, diagnosis, medications, instructions, notes } = req.body;
  
  // Validate required fields
  if (!patientId || !appointmentId || !diagnosis || !medications) {
    return res.status(400).json({ message: 'Missing required prescription data' });
  }
  
  // Insert the prescription into the database
  const sql = `
    INSERT INTO prescriptions (
      doctor_id, patient_id, appointment_id, diagnosis, 
      instructions, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  
  connection.query(
    sql,
    [doctorId, patientId, appointmentId, diagnosis, instructions || '', notes || ''],
    (err, result) => {
      if (err) {
        console.error('Error creating prescription:', err);
        return res.status(500).json({ message: 'Failed to create prescription' });
      }
      
      const prescriptionId = result.insertId;
      
      // Insert medications
      if (medications && medications.length > 0) {
        const medicationValues = medications.map(med => 
          [prescriptionId, med.name, med.dosage, med.frequency, med.duration].map(val => val || '')
        );
        
        const medSql = `
          INSERT INTO prescription_medications 
          (prescription_id, name, dosage, frequency, duration) 
          VALUES ?
        `;
        
        connection.query(medSql, [medicationValues], (err) => {
          if (err) {
            console.error('Error adding medications to prescription:', err);
            return res.status(500).json({ message: 'Failed to add medications to prescription' });
          }
          
          res.status(201).json({ 
            message: 'Prescription created successfully',
            prescriptionId
          });
        });
      } else {
        res.status(201).json({ 
          message: 'Prescription created successfully',
          prescriptionId
        });
      }
    }
  );
};

// Get prescriptions for the currently logged-in doctor
exports.getDoctorPrescriptions = (req, res) => {
  const doctorId = req.user.id;
  
  const sql = `
    SELECT 
      p.id, p.diagnosis, p.instructions, p.notes, p.created_at,
      pt.first_name AS patient_first_name, pt.last_name AS patient_last_name,
      a.appointment_date, a.appointment_time
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    JOIN appointments a ON p.appointment_id = a.id
    WHERE p.doctor_id = ?
    ORDER BY p.created_at DESC
  `;
  
  connection.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error('Error fetching doctor prescriptions:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Get medications for each prescription
    const prescriptionIds = results.map(p => p.id);
    
    if (prescriptionIds.length === 0) {
      return res.status(200).json({ prescriptions: [] });
    }
    
    const medSql = `
      SELECT prescription_id, name, dosage, frequency, duration
      FROM prescription_medications
      WHERE prescription_id IN (?)
    `;
    
    connection.query(medSql, [prescriptionIds], (medErr, medResults) => {
      if (medErr) {
        console.error('Error fetching prescription medications:', medErr);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Group medications by prescription_id
      const medicationsByPrescription = {};
      medResults.forEach(med => {
        if (!medicationsByPrescription[med.prescription_id]) {
          medicationsByPrescription[med.prescription_id] = [];
        }
        medicationsByPrescription[med.prescription_id].push({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        });
      });
      
      // Transform data to camelCase for frontend consistency
      const prescriptions = results.map(prescription => ({
        id: prescription.id,
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        notes: prescription.notes,
        date: prescription.created_at,
        appointmentDate: prescription.appointment_date,
        appointmentTime: prescription.appointment_time,
        patientName: `${prescription.patient_first_name} ${prescription.patient_last_name}`,
        medications: medicationsByPrescription[prescription.id] || []
      }));
      
      res.status(200).json({ prescriptions });
    });
  });
};

// Get prescriptions for the currently logged-in patient
exports.getPatientPrescriptions = (req, res) => {
  const patientId = req.user.id;
  
  const sql = `
    SELECT 
      p.id, p.diagnosis, p.instructions, p.notes, p.created_at,
      d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
      d.specialization AS doctor_specialization,
      a.appointment_date, a.appointment_time
    FROM prescriptions p
    JOIN doctors d ON p.doctor_id = d.id
    JOIN appointments a ON p.appointment_id = a.id
    WHERE p.patient_id = ?
    ORDER BY p.created_at DESC
  `;
  
  connection.query(sql, [patientId], (err, results) => {
    if (err) {
      console.error('Error fetching patient prescriptions:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Get medications for each prescription
    const prescriptionIds = results.map(p => p.id);
    
    if (prescriptionIds.length === 0) {
      return res.status(200).json({ prescriptions: [] });
    }
    
    const medSql = `
      SELECT prescription_id, name, dosage, frequency, duration
      FROM prescription_medications
      WHERE prescription_id IN (?)
    `;
    
    connection.query(medSql, [prescriptionIds], (medErr, medResults) => {
      if (medErr) {
        console.error('Error fetching prescription medications:', medErr);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Group medications by prescription_id
      const medicationsByPrescription = {};
      medResults.forEach(med => {
        if (!medicationsByPrescription[med.prescription_id]) {
          medicationsByPrescription[med.prescription_id] = [];
        }
        medicationsByPrescription[med.prescription_id].push({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        });
      });
      
      // Transform data to camelCase for frontend consistency
      const prescriptions = results.map(prescription => ({
        id: prescription.id,
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        notes: prescription.notes,
        date: prescription.created_at,
        appointmentDate: prescription.appointment_date,
        appointmentTime: prescription.appointment_time,
        doctorName: `Dr. ${prescription.doctor_first_name} ${prescription.doctor_last_name}`,
        doctorSpecialization: prescription.doctor_specialization,
        medications: medicationsByPrescription[prescription.id] || []
      }));
      
      res.status(200).json({ prescriptions });
    });
  });
}; 