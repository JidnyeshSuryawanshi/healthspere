import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';

// Layout component to conditionally render navbar and footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboardPage = location.pathname.includes('dashboard');
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isDashboardPage && <Navbar />}
      <main className={`flex-grow ${!isDashboardPage ? '' : 'h-screen'}`}>
        {children}
      </main>
      {!isDashboardPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/about" element={
          <Layout>
            <About />
          </Layout>
        } />
        <Route path="/contact" element={
          <Layout>
            <Contact />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/privacy" element={
          <Layout>
            <div className="max-w-7xl mx-auto py-16 px-6 text-center">Privacy Policy coming soon...</div>
          </Layout>
        } />
        <Route path="/terms" element={
          <Layout>
            <div className="max-w-7xl mx-auto py-16 px-6 text-center">Terms of Service coming soon...</div>
          </Layout>
        } />
        <Route path="*" element={
          <Layout>
            <div className="max-w-7xl mx-auto py-16 px-6 text-center">Page not found</div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
