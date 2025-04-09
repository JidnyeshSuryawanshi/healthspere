import React, { useState, useEffect } from 'react';
import { doctorService, appointmentService, authService } from '../services/api';
import AppointmentModal from './AppointmentModal';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  
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
    // First, set the selected doctor regardless of auth status
    setSelectedDoctor(doctor);
    
    // Reset form state
    setAppointmentForm({
      appointmentDate: '',
      appointmentTime: '',
      reason: ''
    });
    setAvailableTimeSlots([]);
    setBookingError('');
    setBookingSuccess(false);
    
    // Check authentication after selecting the doctor
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      setBookingError('Please log in to book an appointment');
    } else if (currentUser.userType !== 'patient') {
      setBookingError('Only patients can book appointments');
    }
    
    // Always show the form - it will display the appropriate error if needed
    setShowAppointmentForm(true);
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm({
      ...appointmentForm,
      [name]: value
    });
    
    // If date is changed, fetch available time slots
    if (name === 'appointmentDate' && value && selectedDoctor) {
      fetchAvailableTimeSlots(selectedDoctor.id, value);
    }
  };
  
  // Fetch available time slots for selected date and doctor
  const fetchAvailableTimeSlots = async (doctorId, date) => {
    try {
      setFormLoading(true);
      // Generate all possible 30-minute slots from 9AM to 5PM
      const allTimeSlots = generateTimeSlots();
      
      // Get busy slots from the API
      try {
        const response = await appointmentService.getAvailableTimeSlots(doctorId, date);
        const busySlots = response.busySlots;
        
        // Filter out busy slots
        const available = allTimeSlots.map(slot => ({
          ...slot,
          disabled: busySlots.includes(slot.value)
        }));
        
        setAvailableTimeSlots(available);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        // If API fails, just show all slots as available
        setAvailableTimeSlots(allTimeSlots);
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  // Generate time slots in 30-minute intervals from 9AM to 5PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour >= 12 ? 'PM' : 'AM';
      
      // Add the hour:00 slot
      slots.push({
        label: `${hourFormatted}:00 ${period}`,
        value: `${hour.toString().padStart(2, '0')}:00`
      });
      
      // Add the hour:30 slot
      slots.push({
        label: `${hourFormatted}:30 ${period}`,
        value: `${hour.toString().padStart(2, '0')}:30`
      });
    }
    return slots;
  };
  
  // Handle form submission
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      setBookingError('Please fill all required fields');
      return;
    }
    
    try {
      setFormLoading(true);
      
      // Verify user is logged in and is a patient
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setBookingError('You must be logged in to book an appointment');
        return;
      }
      
      if (currentUser.userType !== 'patient') {
        setBookingError('Only patients can book appointments');
        return;
      }
      
      const appointmentData = {
        doctorId: selectedDoctor.id,
        appointmentDate: appointmentForm.appointmentDate,
        appointmentTime: appointmentForm.appointmentTime,
        reason: appointmentForm.reason
      };
      
      // Use the real appointment booking API
      await appointmentService.bookAppointment(appointmentData);
      
      // Show success message
      setBookingSuccess(true);
      setBookingError('');
      
      // Reset form
      setTimeout(() => {
        setShowAppointmentForm(false);
        setBookingSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error booking appointment:', err);
      if (err.message === 'Only patients can book appointments') {
        setBookingError('Only patients can book appointments. If you are a doctor, please use a patient account to book.');
      } else if (err.message === 'Authentication token is required' || err.message === 'Invalid or expired token') {
        setBookingError('Your session has expired. Please log in again.');
        // Force logout on authentication error
        setTimeout(() => {
          authService.logout();
          window.location.href = '/login';
        }, 2000);
      } else {
        setBookingError(err.message || 'Failed to book appointment. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === '' || 
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === '' || 
      doctor.specialization === selectedSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
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
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="mt-2 text-gray-600">No doctors found</h3>
          <p className="mt-1 text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg mr-3">
                  {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                  <p className="text-sm text-teal-600">{doctor.specialization}</p>
                  <p className="text-sm text-gray-500 mt-1">{doctor.experience} years experience</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Qualifications</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{doctor.qualifications}</p>
              </div>
              
              <button 
                className="mt-4 w-full py-2 px-3 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookAppointment(doctor);
                }}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
      
      <AppointmentModal
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        selectedDoctor={selectedDoctor}
        bookingSuccess={bookingSuccess}
        bookingError={bookingError}
        appointmentForm={appointmentForm}
        handleFormChange={handleFormChange}
        handleSubmit={handleSubmitAppointment}
        availableTimeSlots={availableTimeSlots}
        formLoading={formLoading}
      />
    </div>
  );
};

export default DoctorsList; 