import React, { useState, useEffect } from 'react';
import { doctorService, prescriptionService } from '../services/api';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorService.getDoctorPatients();
      setPatients(response.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      const errorMessage = err.message || 'Failed to fetch patients. Please try again later.';
      setError(errorMessage);
      // Set empty array to avoid rendering issues
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle viewing patient history
  const handleViewHistory = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await doctorService.getPatientHistory(patient.id);
      setPatientHistory(response.history || []);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Error fetching patient history:', err);
      const errorMessage = err.message || 'Failed to fetch patient history. Please try again.';
      setHistoryError(errorMessage);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle viewing prescription details
  const handleViewPrescription = async (prescriptionId) => {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    try {
      // Get prescription details from the server
      const response = await prescriptionService.getPrescriptionById(prescriptionId);
      setSelectedPrescription(response.prescription);
      setShowPrescriptionModal(true);
    } catch (err) {
      console.error('Error fetching prescription:', err);
      const errorMessage = err.message || 'Failed to fetch prescription details. Please try again.';
      setPrescriptionError(errorMessage);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    return searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error Loading Patients</span>
        </div>
        <p className="ml-8 mb-3">{error}</p>
        <div className="ml-8">
          <button
            onClick={fetchPatients}
            className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
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
              placeholder="Search patients..."
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
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="mt-2 text-gray-600">No patients found</h3>
          <p className="mt-1 text-gray-500 text-sm">You haven't treated any patients yet or your search filter is too restrictive</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-3">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</h3>
                  <p className="text-sm text-gray-500 mt-1">Age: {calculateAge(patient.dateOfBirth)}</p>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Visit History</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {patient.appointmentCount} visits
                  </span>
                </div>
                <p className="text-sm text-gray-600">Last visit: {formatDate(patient.lastVisit)}</p>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button 
                  className="w-full py-2 px-3 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  onClick={() => handleViewHistory(patient)}
                >
                  View History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient History Modal */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedPatient.firstName} {selectedPatient.lastName}'s Visit History
              </h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Patient Name</p>
                  <p className="text-sm font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Age</p>
                  <p className="text-sm">{calculateAge(selectedPatient.dateOfBirth)} years</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Total Visits</p>
                  <p className="text-sm">{selectedPatient.appointmentCount}</p>
                </div>
              </div>
            </div>
            
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading patient history...</p>
              </div>
            ) : historyError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Error Loading History</span>
                </div>
                <p>{historyError}</p>
                <button
                  onClick={() => handleViewHistory(selectedPatient)}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            ) : patientHistory.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-gray-600">No visit history found</h3>
                <p className="mt-1 text-gray-500 text-sm">This patient has no recorded appointments.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason for Visit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diagnosis
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientHistory.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                            <div className="text-sm text-gray-500">{appointment.time}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{appointment.reason}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {appointment.diagnosis || 'No diagnosis recorded'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.hasPrescription ? (
                              <button 
                                className="text-blue-600 hover:text-blue-900 font-medium"
                                onClick={() => handleViewPrescription(appointment.prescriptionId)}
                              >
                                View Prescription
                              </button>
                            ) : appointment.status === 'completed' ? (
                              <span className="text-gray-500">No prescription</span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900">Prescription Details</h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            {prescriptionLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading...</p>
              </div>
            ) : prescriptionError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">{prescriptionError}</p>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <p className="text-xs text-gray-500">Prescription #{selectedPrescription.id}</p>
                  <p className="text-sm font-medium">{formatDate(selectedPrescription.date)}</p>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Diagnosis</p>
                    <p className="text-sm">{selectedPrescription.diagnosis}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Instructions</p>
                    <p className="text-sm">{selectedPrescription.instructions || 'No specific instructions'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Medications</p>
                    <ul className="text-sm list-disc list-inside">
                      {selectedPrescription.medications?.map((med, idx) => (
                        <li key={idx} className="mb-1">
                          <span className="font-medium">{med.name}</span> - {med.dosage}
                          {med.frequency && `, ${med.frequency}`}
                          {med.duration && `, for ${med.duration}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPrescriptionModal(false);
                      const printWindow = window.open('', '_blank');
                      
                      // Create styled HTML for printing
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Prescription #${selectedPrescription.id}</title>
                            <style>
                              body { font-family: Arial; max-width: 800px; margin: 20px auto; line-height: 1.6; }
                              h1 { color: #0d9488; text-align: center; font-size: 24px; margin-bottom: 5px; }
                              .header { text-align: center; border-bottom: 1px solid #eaeaea; padding-bottom: 15px; margin-bottom: 20px; }
                              .section { margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
                              .section-title { margin-top: 0; font-size: 16px; color: #666; text-transform: uppercase; }
                              .label { font-weight: bold; margin-right: 10px; }
                              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                              th { background-color: #f2f2f2; }
                              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                              @media print { button { display: none; } }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>Medical Clinic</h1>
                              <p>Prescription #${selectedPrescription.id}</p>
                            </div>
                            
                            <div class="section">
                              <h3 class="section-title">Patient Information</h3>
                              <p><span class="label">Name:</span> ${selectedPrescription.patientName}</p>
                              <p><span class="label">Date:</span> ${formatDate(selectedPrescription.date)}</p>
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
                                  </tr>
                                </thead>
                                <tbody>
                                  ${selectedPrescription.medications.map(med => `
                                    <tr>
                                      <td>${med.name}</td>
                                      <td>${med.dosage}</td>
                                      <td>${med.frequency || 'As needed'}</td>
                                      <td>${med.duration || 'As required'}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                            </div>
                            
                            <div class="footer">
                              <p>Take medications as prescribed. Contact your doctor if you experience any side effects.</p>
                              <p>© ${new Date().getFullYear()} Medical Clinic</p>
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
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList; 