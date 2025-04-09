import React, { useState, useEffect } from 'react';
import { doctorService, appointmentService, authService } from '../services/api';

const SimpleDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors();
        setDoctors(response.doctors);
        setError('');
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Handle opening the appointment form for a specific doctor
  const handleBookAppointment = (doctor) => {
    console.log("Book appointment clicked for doctor:", doctor);
    
    // Always set the doctor
    setSelectedDoctor(doctor);
    
    // Reset form
    setAppointmentForm({
      appointmentDate: '',
      appointmentTime: '',
      reason: ''
    });
    
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setBookingError('Please log in to book an appointment');
    } else if (currentUser.userType !== 'patient') {
      setBookingError('Only patients can book appointments');
    } else {
      setBookingError('');
    }
    
    // Show the form
    setShowAppointmentForm(true);
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm({
      ...appointmentForm,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmitAppointment = (e) => {
    e.preventDefault();
    alert('Appointment booking would happen here. Form values: ' + JSON.stringify(appointmentForm));
    setBookingSuccess(true);
    
    // Auto-close after 2 seconds
    setTimeout(() => {
      setShowAppointmentForm(false);
      setBookingSuccess(false);
    }, 2000);
  };

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === '' || 
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === '' || 
      doctor.specialization === selectedSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  if (loading) {
    return <div>Loading doctors...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      padding: '1.5rem' 
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem' 
      }}>
        Find Doctors
      </h2>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1' }}>
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
        </div>
        
        <div style={{ minWidth: '200px' }}>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          >
            <option value="">All Specializations</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h3 style={{ color: '#4b5563' }}>No doctors found</h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1rem' 
        }}>
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id} 
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1rem',
                transition: 'box-shadow 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  height: '3rem',
                  width: '3rem',
                  borderRadius: '9999px',
                  backgroundColor: '#e6fffa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  marginRight: '0.75rem'
                }}>
                  {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontWeight: 'medium', color: '#111827' }}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#0d9488' }}>
                    {doctor.specialization}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {doctor.experience} years experience
                  </p>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '0.75rem', 
                paddingTop: '0.75rem', 
                borderTop: '1px solid #e5e7eb' 
              }}>
                <h4 style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 'medium', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: '0.25rem' 
                }}>
                  Qualifications
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {doctor.qualifications}
                </p>
              </div>
              
              <button 
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleBookAppointment(doctor)}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Super simple inline modal */}
      {showAppointmentForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '500px',
              margin: '0 1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Book Appointment</h2>
              <button 
                onClick={() => setShowAppointmentForm(false)}
                style={{ cursor: 'pointer', fontSize: '1.5rem', background: 'none', border: 'none' }}
              >
                &times;
              </button>
            </div>
            
            {bookingSuccess ? (
              <div style={{ 
                backgroundColor: '#f0fdf4', 
                padding: '0.75rem', 
                borderRadius: '0.25rem',
                color: '#15803d',
                border: '1px solid #bbf7d0'
              }}>
                Appointment booked successfully! We'll send you a confirmation email shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmitAppointment}>
                {selectedDoctor && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      backgroundColor: '#f0fdfa', 
                      padding: '1rem', 
                      borderRadius: '0.375rem' 
                    }}>
                      <h3 style={{ fontWeight: 'medium', marginBottom: '0.25rem' }}>
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#0d9488' }}>
                        {selectedDoctor.specialization}
                      </p>
                    </div>
                  </div>
                )}
                
                {bookingError && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    padding: '0.75rem', 
                    borderRadius: '0.25rem',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    marginBottom: '1rem'
                  }}>
                    {bookingError}
                    {bookingError === 'Please log in to book an appointment' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <a href="/login" style={{ 
                          color: '#2563eb', 
                          textDecoration: 'underline',
                          fontSize: '0.875rem'
                        }}>
                          Go to login page
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {!bookingError && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        fontWeight: 'medium',
                        marginBottom: '0.25rem'
                      }}>
                        Date
                      </label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={appointmentForm.appointmentDate}
                        onChange={handleFormChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                        required
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        fontWeight: 'medium',
                        marginBottom: '0.25rem'
                      }}>
                        Time
                      </label>
                      <select
                        name="appointmentTime"
                        value={appointmentForm.appointmentTime}
                        onChange={handleFormChange}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                        required
                      >
                        <option value="">Select a time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="09:30">9:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="14:30">2:30 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="15:30">3:30 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="16:30">4:30 PM</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        fontWeight: 'medium',
                        marginBottom: '0.25rem'
                      }}>
                        Reason for Visit
                      </label>
                      <textarea
                        name="reason"
                        value={appointmentForm.reason}
                        onChange={handleFormChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                        required
                        placeholder="Briefly describe your symptoms or reason for the appointment"
                      />
                    </div>
                  </>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  marginTop: '1rem' 
                }}>
                  <button
                    type="button"
                    onClick={() => setShowAppointmentForm(false)}
                    style={{
                      marginRight: '0.75rem',
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      color: '#374151',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingError !== ''}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid transparent',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      color: 'white',
                      backgroundColor: bookingError !== '' ? '#9ca3af' : '#0d9488',
                      cursor: bookingError !== '' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDoctorsList; 