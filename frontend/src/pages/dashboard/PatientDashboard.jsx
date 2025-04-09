import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, doctorService, appointmentService, prescriptionService } from '../../services/api';
import DoctorsList from '../../components/DoctorsList';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);
  
  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });
  
  // State for doctors
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Get current patient information and data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser || currentUser.userType !== 'patient') {
          navigate('/login');
          return;
        }
        
        setPatient(currentUser);
        
        // Fetch appointments
        try {
          const appointmentsResponse = await appointmentService.getUserAppointments();
          setAppointments(appointmentsResponse.appointments);
        } catch (err) {
          console.error('Error fetching appointments:', err);
          // Continue even if appointments fetch fails
        }
        
        // Fetch doctors list for appointment form
        try {
          setDoctorsLoading(true);
          const doctorsResponse = await doctorService.getAllDoctors();
          
          // Transform doctors data to match form requirements
          const formattedDoctors = doctorsResponse.doctors.map(doctor => ({
            id: doctor.id,
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization
          }));
          
          setDoctors(formattedDoctors);
        } catch (err) {
          console.error('Error fetching doctors:', err);
        } finally {
          setDoctorsLoading(false);
        }
        
        // Fetch prescriptions from the API
        try {
          const prescriptionsResponse = await prescriptionService.getPatientPrescriptions();
          setPrescriptions(prescriptionsResponse.prescriptions || []);
        } catch (err) {
          console.error('Error fetching prescriptions:', err);
          // Continue with empty prescriptions array if fetch fails
          setPrescriptions([]);
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
  
  const handleAppointmentFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm({ ...appointmentForm, [name]: value });
  };
  
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!appointmentForm.doctorId || !appointmentForm.appointmentDate || 
        !appointmentForm.appointmentTime || !appointmentForm.reason) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Verify user is still logged in as a patient
      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.userType !== 'patient') {
        setError('You must be logged in as a patient to book appointments');
        
        // If user type doesn't match, redirect to login
        if (!currentUser || currentUser.userType !== 'patient') {
          setTimeout(() => {
            authService.logout();
            navigate('/login');
          }, 2000);
        }
        return;
      }
      
      // Submit appointment to API
      await appointmentService.bookAppointment({
        doctorId: appointmentForm.doctorId,
        appointmentDate: appointmentForm.appointmentDate,
        appointmentTime: appointmentForm.appointmentTime,
        reason: appointmentForm.reason
      });
      
      // Fetch updated appointments
      const response = await appointmentService.getUserAppointments();
      setAppointments(response.appointments);
      
      // Reset form and close modal
      setAppointmentForm({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
      });
      setShowAppointmentForm(false);
      setError('');
      
    } catch (err) {
      const errorMsg = err.message || 'Failed to book appointment. Please try again.';
      setError(errorMsg);
      console.error('Error booking appointment:', err);
      
      // If it's an auth error, redirect to login
      if (errorMsg.includes('authentication') || errorMsg.includes('token') || 
          errorMsg === 'Only patients can book appointments') {
        setTimeout(() => {
          authService.logout();
          navigate('/login');
        }, 2000);
      }
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
      doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, 14, 45);
      doc.text(`Doctor: ${prescription.doctorName}`, 14, 52);
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
      
      // Save PDF with patient name and date - handle special characters
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
  
  // Function to handle viewing appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };
  
  // Function to handle cancelling an appointment
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      
      // Call the API to update the appointment status to 'cancelled'
      await appointmentService.updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Update the appointments list in state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'cancelled' } 
          : appointment
      );
      
      setAppointments(updatedAppointments);
      setShowAppointmentDetails(false);
      
      // Show success message (could implement a toast notification system later)
      alert('Appointment cancelled successfully');
      
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to print appointment details
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
            
            <h2 class="appointment-title">Appointment Confirmation</h2>
            
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
              <h3 class="section-title">Doctor Information</h3>
              <p><span class="label">Name:</span> ${appointment.doctorName}</p>
              <p><span class="label">Specialization:</span> ${appointment.doctorSpecialization}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Patient Information</h3>
              <p><span class="label">Name:</span> ${patient.firstName} ${patient.lastName}</p>
              <p><span class="label">Patient ID:</span> ${patient.id}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Reason for Visit</h3>
              <p>${appointment.reason}</p>
            </div>
            
            <div class="footer">
              <p>Please arrive 15 minutes before your scheduled appointment time.</p>
              <p>If you need to reschedule, please call us at least 24 hours in advance.</p>
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
  
  // Function to handle viewing prescription details
  const handleViewPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetails(true);
  };

  // Function to print prescription details
  const handlePrintPrescription = (prescription) => {
    try {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription #${prescription.id}</title>
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
              .footer {
                margin-top: 40px;
                font-size: 12px;
                text-align: center;
                color: #666;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              table, th, td {
                border: 1px solid #ddd;
              }
              th {
                background-color: #0d9488;
                color: white;
                text-align: left;
                padding: 10px;
              }
              td {
                padding: 8px;
                font-size: 14px;
              }
              tr:nth-child(even) {
                background-color: #f5f5f5;
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
            
            <h2 class="prescription-title">Prescription #${prescription.id}</h2>
            
            <div class="section">
              <h3 class="section-title">Patient Information</h3>
              <p><span class="label">Name:</span> ${patient.firstName} ${patient.lastName}</p>
              <p><span class="label">Patient ID:</span> ${patient.id}</p>
              <p><span class="label">Email:</span> ${patient.email}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Doctor Information</h3>
              <p><span class="label">Name:</span> ${prescription.doctorName}</p>
              <p><span class="label">Specialization:</span> ${prescription.doctorSpecialization}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Prescription Details</h3>
              <p><span class="label">Date:</span> ${new Date(prescription.date).toLocaleDateString()}</p>
              <p><span class="label">Diagnosis:</span> ${prescription.diagnosis}</p>
              <p><span class="label">Instructions:</span> ${prescription.instructions || 'No specific instructions provided.'}</p>
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
                  ${prescription.medications.map(med => `
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
      
    } catch (err) {
      console.error('Error printing prescription:', err);
      alert('Failed to print prescription details. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!patient) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-teal-600">Medical Clinic</h2>
          <p className="text-sm text-gray-500 mt-1">Patient Portal</p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
              <p className="text-xs text-gray-500">{patient.email}</p>
            </div>
          </div>
          
          <nav className="mt-2">
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center py-2 px-4 rounded-md ${activeTab === 'appointments' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointments
            </button>
            
            <button 
              onClick={() => setActiveTab('doctors')}
              className={`w-full flex items-center py-2 px-4 rounded-md mt-1 ${activeTab === 'doctors' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Find Doctors
            </button>
            
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full flex items-center py-2 px-4 rounded-md mt-1 ${activeTab === 'prescriptions' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Prescriptions
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center py-2 px-4 rounded-md mt-1 ${activeTab === 'profile' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
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
              <h1 className="text-2xl font-bold text-gray-800">Your Appointments</h1>
              <button
                onClick={() => setShowAppointmentForm(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Appointment
              </button>
            </div>
            
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-gray-600">No appointments scheduled</h3>
                <p className="mt-1 text-gray-500 text-sm">Click the "Book Appointment" button to schedule a visit.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                          'bg-red-100 text-red-800'}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Reason: {appointment.reason}</p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                      <button 
                        className="text-sm text-teal-600 hover:text-teal-800"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        View Details
                      </button>
                      {appointment.status === 'completed' ? (
                        <button 
                          className="text-sm text-teal-600 hover:text-teal-800"
                          onClick={() => setActiveTab('prescriptions')}
                        >
                          View Prescription
                        </button>
                      ) : (
                        <button className="text-sm text-gray-600 hover:text-gray-800">
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'doctors' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Find Doctors</h1>
              <p className="text-gray-600 mt-1">Browse our specialists and book an appointment</p>
            </div>
            
            <DoctorsList />
          </>
        )}
        
        {activeTab === 'prescriptions' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Prescriptions</h1>
            
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-gray-600">No prescriptions available</h3>
                <p className="mt-1 text-gray-500 text-sm">Your prescriptions will appear here after your appointments.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-teal-50 p-4 border-b border-teal-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-teal-900">Prescribed on {new Date(prescription.date).toLocaleDateString()}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                          #{prescription.id}
                        </span>
                      </div>
                      <p className="text-sm text-teal-800 mt-1">{prescription.doctorName} • {prescription.doctorSpecialization}</p>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{prescription.diagnosis}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{prescription.instructions || 'No specific instructions provided.'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Medications</h4>
                        <div className="space-y-3">
                          {prescription.medications.map((med, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-md border-l-4 border-teal-400">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">{med.name}</p>
                                <p className="text-sm font-semibold text-teal-700">{med.dosage}</p>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {med.frequency || 'As needed'} • {med.duration || 'As required'}
                                {med.notes && <span className="block mt-1 italic">{med.notes}</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <button
                        onClick={() => handleViewPrescriptionDetails(prescription)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium">Personal Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{patient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Patient ID</p>
                    <p className="mt-1">{patient.id}</p>
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
      
      {/* Book Appointment Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Book New Appointment</h3>
              <button 
                onClick={() => setShowAppointmentForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAppointmentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor
                </label>
                <select
                  name="doctorId"
                  value={appointmentForm.doctorId}
                  onChange={handleAppointmentFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={appointmentForm.appointmentDate}
                  onChange={handleAppointmentFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <select
                  name="appointmentTime"
                  value={appointmentForm.appointmentTime}
                  onChange={handleAppointmentFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={appointmentForm.reason}
                  onChange={handleAppointmentFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAppointmentForm(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
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
            
            <div className="bg-teal-50 p-3 rounded-lg mb-4">
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
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Doctor Information</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{selectedAppointment.doctorName}</p>
                <p className="text-sm text-teal-600">{selectedAppointment.doctorSpecialization}</p>
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
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowAppointmentDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
              >
                Close
              </button>
              
              <button
                onClick={() => handlePrintAppointment(selectedAppointment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              {selectedAppointment.status === 'pending' && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                >
                  Cancel Appointment
                </button>
              )}
              
              {selectedAppointment.status === 'completed' && (
                <button
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
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
            
            <div className="bg-teal-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-teal-900">Prescription #{selectedPrescription.id}</h4>
                <span className="text-sm text-teal-700">
                  {new Date(selectedPrescription.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-teal-800 mt-1">
                {selectedPrescription.doctorName} • {selectedPrescription.doctorSpecialization}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Patient Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Doctor Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{selectedPrescription.doctorName}</p>
                  <p className="text-sm text-teal-600">{selectedPrescription.doctorSpecialization}</p>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dosage
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedPrescription.medications.map((med, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {med.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.dosage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.frequency || 'As needed'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.duration || 'As required'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPrescriptionDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              
              <button
                onClick={() => handlePrintPrescription(selectedPrescription)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              <button
                onClick={() => handleDownloadPDF(selectedPrescription)}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

export default PatientDashboard; 