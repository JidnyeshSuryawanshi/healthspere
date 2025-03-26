export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto py-24 px-6 sm:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Modern Healthcare Management
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl">
              Streamlined healthcare management for patients, doctors, and hospitals. Book appointments,
              manage medical records, and access healthcare services all in one place.
            </p>
            <div className="mt-10 flex gap-4">
              <button className="bg-teal-500 text-white px-5 py-2.5 rounded-md hover:bg-teal-600 transition-colors duration-200 font-medium">
                Book Appointment
              </button>
              <button className="text-gray-700 border border-gray-300 px-5 py-2.5 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium">
                Learn More
              </button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                alt="Healthcare professionals" 
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Our Services</h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-8 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Online Appointments</h3>
            <p className="text-gray-600">
              Book appointments with your preferred doctors at your convenience, anytime and anywhere.
            </p>
          </div>
          <div className="p-8 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Records</h3>
            <p className="text-gray-600">
              Access your medical history and prescriptions anytime, anywhere with secure digital storage.
            </p>
          </div>
          <div className="p-8 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Doctors</h3>
            <p className="text-gray-600">
              Connect with experienced healthcare professionals across various medical specialties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
