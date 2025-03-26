export default function About() {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
              About HealthSphere
            </h1>
            <p className="text-lg text-gray-600">
              Revolutionizing healthcare management through innovative technology and patient-centered solutions
            </p>
          </div>
        </div>
      </div>
      
      {/* Mission, Vision, Values Section */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To provide an efficient and user-friendly platform that connects patients with healthcare
              providers, streamlining the healthcare management process for everyone involved.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To become the leading healthcare management solution that transforms how patients
              access healthcare services and how providers deliver care.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
            <ul className="text-gray-600 space-y-2">
              <li>Patient-Centered Care</li>
              <li>Innovation in Healthcare</li>
              <li>Data Security & Privacy</li>
              <li>Accessibility for All</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Why Choose HealthSphere?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-teal-500 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-teal-500 mb-2">100+</div>
              <div className="text-gray-600">Healthcare Providers</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-teal-500 mb-2">50k+</div>
              <div className="text-gray-600">Patients Served</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-teal-500 mb-2">99%</div>
              <div className="text-gray-600">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
