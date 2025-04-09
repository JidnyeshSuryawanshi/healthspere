const connection = require('../database');

// Get appointments for the current logged-in user (patient or doctor)
exports.getUserAppointments = (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;
  
  let sql = '';
  let params = [];
  
  if (userType === 'patient') {
    sql = `
      SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name, 
      d.specialization as doctor_specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    params = [userId];
  } else if (userType === 'doctor') {
    sql = `
      SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    params = [userId];
  } else {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Transform data to camelCase for frontend consistency
    const appointments = results.map(appointment => {
      const transformedAppointment = {
        id: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      };
      
      // Add doctor details for patient users
      if (userType === 'patient') {
        transformedAppointment.doctorName = `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`;
        transformedAppointment.doctorSpecialization = appointment.doctor_specialization;
      }
      
      // Add patient details for doctor users
      if (userType === 'doctor') {
        transformedAppointment.patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;
      }
      
      return transformedAppointment;
    });
    
    res.status(200).json({ appointments });
  });
};

// Book a new appointment
exports.bookAppointment = (req, res) => {
  const patientId = req.user.id; // The logged-in user's ID
  const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
  
  // Validate user is a patient
  if (req.user.userType !== 'patient') {
    return res.status(403).json({ message: 'Only patients can book appointments' });
  }
  
  // Validate required fields
  if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if the time slot is available
  const checkSlotSql = `
    SELECT id FROM appointments 
    WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
  `;
  
  connection.query(checkSlotSql, [doctorId, appointmentDate, appointmentTime], (err, results) => {
    if (err) {
      console.error('Error checking appointment slot:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    
    // All checks passed, insert the appointment
    const insertSql = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    
    connection.query(insertSql, [patientId, doctorId, appointmentDate, appointmentTime, reason], (err, result) => {
      if (err) {
        console.error('Error booking appointment:', err);
        return res.status(500).json({ message: 'Error booking appointment' });
      }
      
      res.status(201).json({ 
        message: 'Appointment booked successfully',
        appointmentId: result.insertId
      });
    });
  });
};

// Get available time slots for a doctor on a specific date
exports.getAvailableTimeSlots = (req, res) => {
  const { doctorId, date } = req.query;
  
  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Doctor ID and date are required' });
  }
  
  // Query to find busy time slots
  const sql = `
    SELECT appointment_time FROM appointments 
    WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'
  `;
  
  connection.query(sql, [doctorId, date], (err, results) => {
    if (err) {
      console.error('Error fetching time slots:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Extract busy time slots
    const busySlots = results.map(row => row.appointment_time);
    
    res.status(200).json({ busySlots });
  });
};

// Update appointment status (for doctors to confirm/cancel)
exports.updateAppointmentStatus = (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;
  const userType = req.user.userType;
  
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  // First check if this user has the right to update this appointment
  let checkSql = '';
  let params = [];
  
  if (userType === 'doctor') {
    checkSql = 'SELECT id FROM appointments WHERE id = ? AND doctor_id = ?';
    params = [appointmentId, userId];
  } else if (userType === 'patient') {
    // Patients can only cancel their own appointments
    if (status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }
    checkSql = 'SELECT id FROM appointments WHERE id = ? AND patient_id = ?';
    params = [appointmentId, userId];
  } else {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  
  connection.query(checkSql, params, (err, results) => {
    if (err) {
      console.error('Error checking appointment:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission to update it' });
    }
    
    // Update the appointment status
    const updateSql = 'UPDATE appointments SET status = ? WHERE id = ?';
    
    connection.query(updateSql, [status, appointmentId], (err) => {
      if (err) {
        console.error('Error updating appointment status:', err);
        return res.status(500).json({ message: 'Error updating appointment status' });
      }
      
      res.status(200).json({ message: 'Appointment status updated successfully' });
    });
  });
}; 