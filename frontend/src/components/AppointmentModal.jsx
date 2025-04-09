import React from 'react';
import ReactDOM from 'react-dom';

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  selectedDoctor, 
  bookingSuccess, 
  bookingError,
  appointmentForm,
  handleFormChange,
  handleSubmit,
  availableTimeSlots,
  formLoading
}) => {
  if (!isOpen) return null;
  
  // Create portal to render modal at root of document
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">Book Appointment</h2>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        {bookingSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            Appointment booked successfully! We'll send you a confirmation email shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {selectedDoctor && (
              <div className="mb-4">
                <div className="bg-teal-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-1">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                  <p className="text-sm text-teal-600">{selectedDoctor.specialization}</p>
                </div>
              </div>
            )}
            
            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {bookingError}
                {(bookingError.includes('log in') || bookingError.includes('session has expired')) && (
                  <div className="mt-2">
                    <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
                      Go to login page
                    </a>
                  </div>
                )}
                {bookingError === 'Only patients can book appointments' && (
                  <div className="mt-2 text-sm">
                    Doctors cannot book appointments. Please use a patient account to book appointments.
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={appointmentForm.appointmentDate}
                onChange={handleFormChange}
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
                disabled={bookingError !== ''}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              {formLoading && appointmentForm.appointmentDate ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading available slots...</span>
                </div>
              ) : appointmentForm.appointmentDate ? (
                <select
                  name="appointmentTime"
                  value={appointmentForm.appointmentTime}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                  disabled={bookingError !== ''}
                >
                  <option value="">Select a time slot</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value} disabled={slot.disabled || bookingError !== ''}>
                      {slot.label}{slot.disabled ? ' (Not Available)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-500 italic">Please select a date first</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                name="reason"
                value={appointmentForm.reason}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
                placeholder="Briefly describe your symptoms or reason for the appointment"
                disabled={bookingError !== ''}
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  bookingError !== '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                }`}
                disabled={formLoading || bookingError !== ''}
              >
                {formLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AppointmentModal; 