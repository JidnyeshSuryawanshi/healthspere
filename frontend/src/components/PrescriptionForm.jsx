import React, { useState } from 'react';

const PrescriptionForm = ({ appointment, onClose, onSave }) => {
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    instructions: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '', notes: '' }
    ]
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData({ ...prescriptionData, [name]: value });
  };
  
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescriptionData.medications];
    updatedMedications[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medications: updatedMedications });
  };
  
  const addMedication = () => {
    setPrescriptionData({
      ...prescriptionData,
      medications: [
        ...prescriptionData.medications,
        { name: '', dosage: '', frequency: '', duration: '', notes: '' }
      ]
    });
  };
  
  const removeMedication = (index) => {
    if (prescriptionData.medications.length === 1) return;
    
    const updatedMedications = [...prescriptionData.medications];
    updatedMedications.splice(index, 1);
    setPrescriptionData({ ...prescriptionData, medications: updatedMedications });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine data for submission
    const prescriptionToSave = {
      ...prescriptionData,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      date: new Date().toISOString().split('T')[0]
    };
    
    onSave(prescriptionToSave);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">Create Prescription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">Patient: {appointment.patientName}</p>
                <p className="text-sm text-gray-500">Date: {appointment.date} | Time: {appointment.time}</p>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-sm mt-2">Reason: {appointment.reason}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              rows="3"
              value={prescriptionData.diagnosis}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter diagnosis details"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows="2"
              value={prescriptionData.instructions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Special instructions for the patient"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900">Medications</h3>
              <button
                type="button"
                onClick={addMedication}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Medication
              </button>
            </div>
            
            {prescriptionData.medications.map((medication, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Medication #{index + 1}</h4>
                  {prescriptionData.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g., 3 times a day"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g., 7 days"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={medication.notes}
                      onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g., Take after meals"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm; 