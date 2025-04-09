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