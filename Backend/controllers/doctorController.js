const connection = require('../database');

// Get all doctors
exports.getAllDoctors = (req, res) => {
  const sql = "SELECT id, first_name, last_name, specialization, experience, qualifications FROM doctors";
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching doctors:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Transform data to camelCase for frontend consistency
    const doctors = results.map(doctor => ({
      id: doctor.id,
      firstName: doctor.first_name,
      lastName: doctor.last_name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      qualifications: doctor.qualifications
    }));
    
    res.status(200).json({ doctors });
  });
};

// Get patients for the currently logged-in doctor
exports.getDoctorPatients = (req, res) => {
  const doctorId = req.user.id;
  
  // Get all unique patients who have had appointments with this doctor
  const sql = `
    SELECT DISTINCT p.id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth,
    (SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND patient_id = p.id) as appointment_count,
    (SELECT MAX(appointment_date) FROM appointments WHERE doctor_id = ? AND patient_id = p.id) as last_visit
    FROM patients p
    JOIN appointments a ON p.id = a.patient_id
    WHERE a.doctor_id = ?
    ORDER BY last_visit DESC
  `;
  
  connection.query(sql, [doctorId, doctorId, doctorId], (err, results) => {
    if (err) {
      console.error('Error fetching doctor patients:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Transform data to camelCase for frontend consistency
    const patients = results.map(patient => ({
      id: patient.id,
      firstName: patient.first_name,
      lastName: patient.last_name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.date_of_birth,
      appointmentCount: patient.appointment_count,
      lastVisit: patient.last_visit
    }));
    
    res.status(200).json({ patients });
  });
};

// Get appointment history for a specific patient
exports.getPatientHistory = (req, res) => {
  const doctorId = req.user.id;
  const patientId = req.params.patientId;
  
  // Validate patientId
  if (!patientId) {
    return res.status(400).json({ message: 'Patient ID is required' });
  }
  
  // SQL to get all appointments with optional prescription data
  const sql = `
    SELECT 
      a.id as appointment_id,
      a.appointment_date,
      a.appointment_time,
      a.reason,
      a.status,
      p.id as prescription_id,
      p.diagnosis,
      (p.id IS NOT NULL) as has_prescription
    FROM appointments a
    LEFT JOIN prescriptions p ON a.id = p.appointment_id
    WHERE a.doctor_id = ? AND a.patient_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;
  
  connection.query(sql, [doctorId, patientId], (err, results) => {
    if (err) {
      console.error('Error fetching patient history:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Transform data to camelCase for frontend consistency
    const history = results.map(appointment => ({
      id: appointment.appointment_id,
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      reason: appointment.reason,
      status: appointment.status,
      prescriptionId: appointment.prescription_id,
      diagnosis: appointment.diagnosis,
      hasPrescription: appointment.has_prescription === 1
    }));
    
    res.status(200).json({ history });
  });
}; 