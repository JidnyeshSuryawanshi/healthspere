import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, appointmentService, prescriptionService } from '../../services/api';
import PrescriptionForm from '../../components/PrescriptionForm';
import PatientsList from '../../components/PatientsList';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);
  
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
  
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handlePrintAppointment = (appointment) => {
    try {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Appointment Details</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eaeaea;
              }
              .clinic-name {
                color: #0d9488;
                font-size: 24px;
                margin: 0;
              }
              .appointment-title {
                font-size: 20px;
                margin: 30px 0 15px;
              }
              .section {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 5px;
              }
              .section-title {
                margin-top: 0;
                font-size: 16px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .label {
                font-weight: bold;
                margin-right: 10px;
              }
              .footer {
                margin-top: 40px;
                font-size: 12px;
                text-align: center;
                color: #666;
              }
              .status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
              }
              .status-confirmed {
                background-color: #d1fae5;
                color: #065f46;
              }
              .status-pending {
                background-color: #fef3c7;
                color: #92400e;
              }
              .status-cancelled {
                background-color: #fee2e2;
                color: #b91c1c;
              }
              .status-completed {
                background-color: #dbeafe;
                color: #1e40af;
              }
              @media print {
                body {
                  padding: 0;
                }
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="clinic-name">Medical Clinic</h1>
              <p>Professional Healthcare Services</p>
            </div>
            
            <h2 class="appointment-title">Appointment Details</h2>
            
            <div class="section">
              <h3 class="section-title">Appointment Information</h3>
              <p><span class="label">Date:</span> ${appointment.date}</p>
              <p><span class="label">Time:</span> ${appointment.time}</p>
              <p><span class="label">Status:</span> 
                <span class="status status-${appointment.status}">
                  ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </p>
              <p><span class="label">Appointment ID:</span> ${appointment.id}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Patient Information</h3>
              <p><span class="label">Name:</span> ${appointment.patientName}</p>
              <p><span class="label">Patient ID:</span> ${appointment.patientId}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Doctor Information</h3>
              <p><span class="label">Name:</span> Dr. ${doctor.firstName} ${doctor.lastName}</p>
              <p><span class="label">Doctor ID:</span> ${doctor.id}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Reason for Visit</h3>
              <p>${appointment.reason}</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Medical Clinic. All rights reserved.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <button onclick="window.print();" style="padding: 10px 20px; background-color: #0d9488; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print Appointment
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
    } catch (err) {
      console.error('Error printing appointment:', err);
      alert('Failed to print appointment details. Please try again.');
    }
  };
  
  const handleViewPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetails(true);
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
  
  // Function to download prescription as PDF
  const handleDownloadPDF = (prescription) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add clinic header
      doc.setFontSize(18);
      doc.setTextColor(0, 128, 128);
      doc.text('Medical Clinic', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Healthcare Services', 105, 22, { align: 'center' });
      
      // Add horizontal line
      doc.setDrawColor(0, 128, 128);
      doc.setLineWidth(0.5);
      doc.line(14, 25, 196, 25);
      
      // Prescription details
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Prescription', 14, 35);
      
      // Patient and doctor info
      doc.setFontSize(10);
      doc.text(`Patient: ${prescription.patientName}`, 14, 45);
      doc.text(`Doctor: Dr. ${doctor.firstName} ${doctor.lastName}`, 14, 52);
      doc.text(`Date: ${new Date(prescription.date).toLocaleDateString()}`, 14, 59);
      doc.text(`Prescription ID: ${prescription.id}`, 14, 66);
      
      // Diagnosis and instructions
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Diagnosis:', 14, 76);
      
      // Handle long text for diagnosis with word wrap
      const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 180);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(diagnosisLines, 14, 83);
      
      // Adjust position based on diagnosis text length
      let yPosition = 83 + (diagnosisLines.length * 5);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Instructions:', 14, yPosition + 10);
      
      // Handle long text for instructions with word wrap
      const instructionsText = prescription.instructions || 'None provided';
      const instructionsLines = doc.splitTextToSize(instructionsText, 180);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(instructionsLines, 14, yPosition + 17);
      
      // Adjust position based on instructions text length
      yPosition = yPosition + 17 + (instructionsLines.length * 5);
      
      // Medications table
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Medications:', 14, yPosition + 10);
      
      // Prepare medications data for table
      const tableColumn = ["Medication", "Dosage", "Frequency", "Duration", "Notes"];
      const tableRows = [];
      
      // Ensure medications array exists and is iterable
      const medications = Array.isArray(prescription.medications) ? prescription.medications : [];
      medications.forEach(med => {
        const medData = [
          med.name || '',
          med.dosage || '',
          med.frequency || '-',
          med.duration || '-',
          med.notes || '-'
        ];
        tableRows.push(medData);
      });
      
      // Add table with error handling
      try {
        doc.autoTable({
          startY: yPosition + 15,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [0, 128, 128], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { top: 10 }
        });
      } catch (tableError) {
        // If table generation fails, add a simple text instead
        doc.text('Medication details could not be formatted as a table.', 14, yPosition + 15);
        console.error('Table generation error:', tableError);
      }
      
      // Footer - positioned at the bottom of the page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('This prescription was generated electronically from Medical Clinic records system.', 105, pageHeight - 15, { align: 'center' });
      
      // Save PDF with prescription ID
      const fileName = `prescription_${prescription.id}.pdf`;
      
      // Use save with try-catch
      try {
        doc.save(fileName);
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        
        // Alternative approach: open in new window
        window.open(URL.createObjectURL(doc.output('blob')));
      }
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Show more specific error message if available
      alert(`Failed to generate PDF: ${err.message || 'Unknown error occurred'}`);
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
                        onClick={() => handleViewDetails(appointment)}
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
                        onClick={() => handleViewPrescriptionDetails(prescription)}
                      >
                        View Details
                      </button>
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => handleDownloadPDF(prescription)}
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
      
      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>
              <button 
                onClick={() => setShowAppointmentDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{selectedAppointment.date}</p>
                  <p className="text-sm">{selectedAppointment.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'}`}
                >
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Patient Information</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-gray-600">Patient ID: {selectedAppointment.patientId}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Reason for Visit</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{selectedAppointment.reason}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Appointment ID</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-mono">{selectedAppointment.id}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAppointmentDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              
              <button
                onClick={() => handlePrintAppointment(selectedAppointment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              {selectedAppointment.status === 'pending' && (
                <div className="space-x-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedAppointment.id, 'confirmed');
                      setShowAppointmentDetails(false);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedAppointment.id, 'cancelled');
                      setShowAppointmentDetails(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {selectedAppointment.status === 'confirmed' && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => {
                    setShowAppointmentDetails(false);
                    handleWritePrescription(selectedAppointment);
                  }}
                >
                  Write Prescription
                </button>
              )}
              
              {selectedAppointment.status === 'completed' && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => {
                    setShowAppointmentDetails(false);
                    setActiveTab('prescriptions');
                  }}
                >
                  View Prescription
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Prescription Details Modal */}
      {showPrescriptionDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Prescription Details</h3>
              <button 
                onClick={() => setShowPrescriptionDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-blue-900">Prescription #{selectedPrescription.id}</h4>
                <span className="text-sm text-blue-700">
                  {new Date(selectedPrescription.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-blue-800 mt-1">
                Patient: {selectedPrescription.patientName}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Patient Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{selectedPrescription.patientName}</p>
                  <p className="text-sm text-gray-600">Patient ID: {selectedPrescription.patientId}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Doctor Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
                  <p className="text-sm text-blue-600">Doctor ID: {doctor.id}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Diagnosis</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{selectedPrescription.diagnosis}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Instructions</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{selectedPrescription.instructions || 'No specific instructions provided.'}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Medications</h4>
              <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPrescription.medications.map((med, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-xs text-gray-900">{med.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{med.dosage}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{med.frequency || 'As needed'}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{med.duration || 'As required'}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{med.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPrescriptionDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  
                  // Create a styled HTML document for printing
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Prescription #${selectedPrescription.id}</title>
                        <style>
                          body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                          }
                          .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 1px solid #eaeaea;
                          }
                          .clinic-name {
                            color: #0d9488;
                            font-size: 24px;
                            margin: 0;
                          }
                          .prescription-title {
                            font-size: 20px;
                            margin: 30px 0 15px;
                          }
                          .section {
                            margin-bottom: 20px;
                            padding: 15px;
                            background-color: #f9fafb;
                            border-radius: 5px;
                          }
                          .section-title {
                            margin-top: 0;
                            font-size: 16px;
                            color: #666;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          }
                          .label {
                            font-weight: bold;
                            margin-right: 10px;
                          }
                          table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                          }
                          th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                          }
                          th {
                            background-color: #f2f2f2;
                            font-weight: bold;
                          }
                          tr:nth-child(even) {
                            background-color: #f9f9f9;
                          }
                          .footer {
                            margin-top: 40px;
                            font-size: 12px;
                            text-align: center;
                            color: #666;
                          }
                          @media print {
                            body {
                              padding: 0;
                            }
                            button {
                              display: none;
                            }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 class="clinic-name">Medical Clinic</h1>
                          <p>Professional Healthcare Services</p>
                        </div>
                        
                        <h2 class="prescription-title">Prescription #${selectedPrescription.id}</h2>
                        
                        <div class="section">
                          <h3 class="section-title">Prescription Information</h3>
                          <p><span class="label">Date:</span> ${new Date(selectedPrescription.date).toLocaleDateString()}</p>
                          <p><span class="label">Prescription ID:</span> ${selectedPrescription.id}</p>
                        </div>
                        
                        <div class="section">
                          <h3 class="section-title">Patient Information</h3>
                          <p><span class="label">Name:</span> ${selectedPrescription.patientName}</p>
                          <p><span class="label">Patient ID:</span> ${selectedPrescription.patientId}</p>
                        </div>
                        
                        <div class="section">
                          <h3 class="section-title">Doctor Information</h3>
                          <p><span class="label">Name:</span> Dr. ${doctor.firstName} ${doctor.lastName}</p>
                          <p><span class="label">Doctor ID:</span> ${doctor.id}</p>
                        </div>
                        
                        <div class="section">
                          <h3 class="section-title">Diagnosis</h3>
                          <p>${selectedPrescription.diagnosis}</p>
                        </div>
                        
                        <div class="section">
                          <h3 class="section-title">Instructions</h3>
                          <p>${selectedPrescription.instructions || 'No specific instructions provided.'}</p>
                        </div>
                        
                        <div class="section">
                          <h3 class="section-title">Medications</h3>
                          <table>
                            <thead>
                              <tr>
                                <th>Medication</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${selectedPrescription.medications.map(med => `
                                <tr>
                                  <td>${med.name}</td>
                                  <td>${med.dosage}</td>
                                  <td>${med.frequency || 'As needed'}</td>
                                  <td>${med.duration || 'As required'}</td>
                                  <td>${med.notes || '-'}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </div>
                        
                        <div class="footer">
                          <p>Take medications as prescribed. Contact your doctor if you experience any side effects.</p>
                          <p>© ${new Date().getFullYear()} Medical Clinic. All rights reserved.</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                          <button onclick="window.print();" style="padding: 10px 20px; background-color: #0d9488; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Print Prescription
                          </button>
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              <button
                onClick={() => handleDownloadPDF(selectedPrescription)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard; 