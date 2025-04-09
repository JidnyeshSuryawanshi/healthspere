import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, appointmentService, prescriptionService } from '../../services/api';
import PrescriptionForm from '../../components/PrescriptionForm';
import PatientsList from '../../components/PatientsList';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  
  const navigate = useNavigate();
  
  // Get current doctor information and appointments from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser || currentUser.userType !== 'doctor') {
          navigate('/login');
          return;
        }
        
        setDoctor(currentUser);
        
        // Fetch appointments
        try {
          const appointmentsResponse = await appointmentService.getUserAppointments();
          setAppointments(appointmentsResponse.appointments);
        } catch (err) {
          console.error('Error fetching appointments:', err);
          // Continue with empty appointments array if fetch fails
        }
        
        // Fetch prescriptions from the API
        try {
          const prescriptionsResponse = await prescriptionService.getDoctorPrescriptions();
          setPrescriptions(prescriptionsResponse.prescriptions || []);
        } catch (err) {
          console.error('Error fetching prescriptions:', err);
          // Continue with empty prescriptions array if fetch fails
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  const handleWritePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
  };
  
  const handleSavePrescription = async (prescriptionData) => {
    try {
      setLoading(true);
      console.log('Saving prescription:', prescriptionData);
      
      // Save the prescription to the database
      await prescriptionService.createPrescription({
        ...prescriptionData,
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId,
        doctorId: doctor.id
      });
      
      // Update local state with the new prescription
      setPrescriptions([...prescriptions, prescriptionData]);
      
      // Close the form
      setShowPrescriptionForm(false);
      
      // Update the appointment status to completed
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, 'completed');
      
      // Update the appointments list in state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === selectedAppointment.id 
          ? { ...appointment, status: 'completed' } 
          : appointment
      );
      setAppointments(updatedAppointments);
      
      // Show success notification or feedback (not implemented in this example)
      
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle appointment status update
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      
      // Update status on the server
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      );
      
      setAppointments(updatedAppointments);
      setError('');
    } catch (err) {
      setError('Failed to update appointment status. Please try again.');
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!doctor) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-teal-600">Medical Clinic</h2>
          <p className="text-sm text-gray-500 mt-1">Doctor Portal</p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
              <p className="text-xs text-gray-500">{doctor.email}</p>
            </div>
          </div>
          
          <nav className="mt-2">
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center py-2 px-4 rounded-md ${activeTab === 'appointments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointments
            </button>
            
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full flex items-center py-2 px-4 rounded-md mt-1 ${activeTab === 'prescriptions' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Prescriptions
            </button>
            
            <button 
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center py-2 px-4 rounded-md mt-1 ${activeTab === 'patients' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              My Patients
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center py-2 px-4 rounded-md mt-1 ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
          </nav>
        </div>
        
        <div className="p-4 absolute bottom-0 w-64 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-2 px-4 text-red-600 hover:bg-red-50 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'appointments' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Today's Appointments</h1>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  <span className="hidden md:inline">Filter</span> 
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 md:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  <span className="hidden md:inline">View Calendar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 md:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-gray-600">No appointments scheduled for today</h3>
                <p className="mt-1 text-gray-500 text-sm">You can check other dates using the calendar.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">{appointment.date}</p>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">{appointment.patientName}</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Reason: {appointment.reason}</p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => console.log('View appointment details', appointment.id)}
                      >
                        View Details
                      </button>
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button 
                            className="text-sm text-green-600 hover:text-green-800"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button 
                            className="text-sm text-red-600 hover:text-red-800"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => handleWritePrescription(appointment)}
                        >
                          Write Prescription
                        </button>
                      )}
                      {appointment.status === 'completed' && (
                        <button 
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => setActiveTab('prescriptions')}
                        >
                          View Prescription
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'prescriptions' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Prescriptions</h1>
            
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-gray-600">No prescriptions created yet</h3>
                <p className="mt-1 text-gray-500 text-sm">Create prescriptions from the appointments tab.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Date: {prescription.date}</p>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-lg font-medium text-gray-900">Patient: {prescription.patientName}</h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                        <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                      </div>
                      {prescription.medications.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Medications:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {prescription.medications.map((med, idx) => (
                              <li key={idx}>{med.name} - {med.dosage}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => console.log('View prescription details', index)}
                      >
                        View Details
                      </button>
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => console.log('Download PDF', index)}
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'patients' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
            </div>
            
            <PatientsList />
          </>
        )}
        
        {activeTab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium">Doctor Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1">Dr. {doctor.firstName} {doctor.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{doctor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Doctor ID</p>
                    <p className="mt-1">{doctor.id}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <PrescriptionForm 
          appointment={selectedAppointment}
          onClose={() => setShowPrescriptionForm(false)}
          onSave={handleSavePrescription}
        />
      )}
    </div>
  );
};

export default DoctorDashboard; 