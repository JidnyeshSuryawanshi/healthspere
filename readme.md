# Medical Clinic Management System

A comprehensive web application for managing a medical clinic, built with React for the frontend and Express.js with MySQL for the backend.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Installation](#installation)
- [Usage](#usage)

## Overview

This Medical Clinic Management System provides a complete solution for managing a medical clinic's operations. It includes separate portals for doctors and patients, appointment scheduling, prescription management, and patient record tracking. The system aims to streamline healthcare delivery by providing an integrated platform for all clinic stakeholders.

## Features

### Patient Portal
- **User Authentication**: Register and log in as a patient
- **Doctor Search**: Browse and search for doctors by name or specialization
- **Appointment Management**: 
  - Book appointments with preferred doctors
  - View upcoming and past appointments
  - View appointment details
  - Print appointment details
- **Prescription Access**: 
  - View prescriptions prescribed by doctors
  - See detailed prescription information including diagnosis, medications, and instructions
  - Print prescriptions
- **Patient Profile**: View personal information and patient ID

### Doctor Portal
- **User Authentication**: Register and log in as a doctor
- **Appointment Management**:
  - View daily appointments
  - Confirm or cancel pending appointments
  - View appointment details
  - Print appointment details
- **Prescription Management**:
  - Create new prescriptions for patients
  - View all prescriptions issued
  - Download prescriptions as PDF
- **Patient Management**:
  - View list of patients
  - Access patient history and visit details
  - View patient prescriptions
- **Doctor Profile**: View professional information and doctor ID

## Technology Stack

### Frontend
- **React.js**: Frontend library for building the user interface
- **React Router**: For navigation and routing
- **Tailwind CSS**: For styling and responsive design
- **Axios**: For API requests
- **jsPDF**: For generating PDF documents

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database management system
- **JWT**: For authentication and authorization
- **Bcrypt**: For password hashing

## Project Structure

```
.
├── Backend/
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── doctorController.js
│   │   └── prescriptionController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── database.js
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── DoctorsList.jsx
    │   │   ├── PatientsList.jsx
    │   │   └── PrescriptionForm.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   └── dashboard/
    │   │       ├── DoctorDashboard.jsx
    │   │       └── PatientDashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Database Schema

### Tables

#### `patients`
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| email | VARCHAR(100) | Unique email address |
| password | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(50) | Patient's first name |
| last_name | VARCHAR(50) | Patient's last name |
| date_of_birth | DATE | Patient's date of birth |
| gender | VARCHAR(10) | Patient's gender |
| phone | VARCHAR(20) | Contact phone number |
| address | TEXT | Patient's address |

#### `doctors`
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| email | VARCHAR(100) | Unique email address |
| password | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(50) | Doctor's first name |
| last_name | VARCHAR(50) | Doctor's last name |
| specialization | VARCHAR(100) | Doctor's specialization |
| license_number | VARCHAR(50) | Professional license number |
| experience | INT | Years of experience |
| qualifications | TEXT | Educational and professional qualifications |

#### `appointments`
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| patient_id | INT | Foreign key to patients table |
| doctor_id | INT | Foreign key to doctors table |
| appointment_date | DATE | Date of appointment |
| appointment_time | VARCHAR(10) | Time of appointment |
| reason | TEXT | Reason for visit |
| status | VARCHAR(20) | Status (pending, confirmed, completed, cancelled) |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | When the appointment was created |
| updated_at | TIMESTAMP | When the appointment was last updated |

#### `prescriptions`
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| appointment_id | INT | Foreign key to appointments table |
| doctor_id | INT | Foreign key to doctors table |
| patient_id | INT | Foreign key to patients table |
| diagnosis | TEXT | Medical diagnosis |
| instructions | TEXT | Treatment instructions |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | When the prescription was created |
| updated_at | TIMESTAMP | When the prescription was last updated |

#### `prescription_medications`
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| prescription_id | INT | Foreign key to prescriptions table |
| name | VARCHAR(100) | Medication name |
| dosage | VARCHAR(50) | Medication dosage |
| frequency | VARCHAR(50) | How often to take the medication |
| duration | VARCHAR(50) | How long to take the medication |

## API Routes

### Authentication Routes

#### `POST /api/auth/register`
- **Description**: Register a new user (patient or doctor)
- **Request Body**:
  - `email`: User email
  - `password`: User password
  - `userType`: "patient" or "doctor"
  - `firstName`: User's first name
  - `lastName`: User's last name
  - Additional fields depending on user type (date of birth, specialization, etc.)
- **Response**: 
  - Success: `{ message: 'Registration successful', userId: <id> }`
  - Error: `{ message: <error_message> }`

#### `POST /api/auth/login`
- **Description**: Log in an existing user
- **Request Body**:
  - `email`: User email
  - `password`: User password
  - `userType`: "patient" or "doctor"
- **Response**: 
  - Success: `{ message: 'Login successful', user: <user_object>, token: <jwt_token> }`
  - Error: `{ message: <error_message> }`

### Doctor Routes

#### `GET /api/doctors/all`
- **Description**: Get list of all doctors
- **Authorization**: None required
- **Response**: 
  - Success: `{ doctors: [<doctor_objects>] }`
  - Error: `{ message: <error_message> }`

#### `GET /api/doctors/my-patients`
- **Description**: Get list of doctor's patients
- **Authorization**: Doctor JWT required
- **Response**: 
  - Success: `{ patients: [<patient_objects>] }`
  - Error: `{ message: <error_message> }`

#### `GET /api/doctors/patient-history/:patientId`
- **Description**: Get patient appointment history
- **Authorization**: Doctor JWT required
- **Response**: 
  - Success: `{ appointments: [<appointment_objects>] }`
  - Error: `{ message: <error_message> }`

### Appointment Routes

#### `GET /api/appointments/user`
- **Description**: Get user's appointments (works for both doctors and patients)
- **Authorization**: JWT required
- **Response**: 
  - Success: `{ appointments: [<appointment_objects>] }`
  - Error: `{ message: <error_message> }`

#### `POST /api/appointments/book`
- **Description**: Book a new appointment
- **Authorization**: Patient JWT required
- **Request Body**:
  - `doctorId`: Doctor's ID
  - `appointmentDate`: Date of appointment
  - `appointmentTime`: Time of appointment
  - `reason`: Reason for visit
- **Response**: 
  - Success: `{ message: 'Appointment booked successfully', appointmentId: <id> }`
  - Error: `{ message: <error_message> }`

#### `GET /api/appointments/available-slots`
- **Description**: Get available appointment slots for a doctor on a specific date
- **Authorization**: JWT required
- **Query Parameters**:
  - `doctorId`: Doctor's ID
  - `date`: Date to check availability
- **Response**: 
  - Success: `{ availableSlots: [<time_slots>] }`
  - Error: `{ message: <error_message> }`

#### `PUT /api/appointments/:id/status`
- **Description**: Update appointment status
- **Authorization**: Doctor JWT required
- **Request Body**:
  - `status`: New status (confirmed, cancelled, completed)
- **Response**: 
  - Success: `{ message: 'Appointment status updated successfully' }`
  - Error: `{ message: <error_message> }`

### Prescription Routes

#### `POST /api/prescriptions/create`
- **Description**: Create a new prescription
- **Authorization**: Doctor JWT required
- **Request Body**:
  - `patientId`: Patient's ID
  - `appointmentId`: Appointment's ID
  - `diagnosis`: Medical diagnosis
  - `medications`: Array of medication objects
  - `instructions`: Treatment instructions (optional)
  - `notes`: Additional notes (optional)
- **Response**: 
  - Success: `{ message: 'Prescription created successfully', prescriptionId: <id> }`
  - Error: `{ message: <error_message> }`

#### `GET /api/prescriptions/doctor`
- **Description**: Get prescriptions created by the logged-in doctor
- **Authorization**: Doctor JWT required
- **Response**: 
  - Success: `{ prescriptions: [<prescription_objects>] }`
  - Error: `{ message: <error_message> }`

#### `GET /api/prescriptions/patient`
- **Description**: Get prescriptions for the logged-in patient
- **Authorization**: Patient JWT required
- **Response**: 
  - Success: `{ prescriptions: [<prescription_objects>] }`
  - Error: `{ message: <error_message> }`

#### `GET /api/prescriptions/public/:id`
- **Description**: Get a specific prescription by ID without authentication
- **Authorization**: None required
- **Response**: 
  - Success: `{ prescription: <prescription_object> }`
  - Error: `{ message: <error_message> }`

## Authentication

The application uses JSON Web Tokens (JWT) for authentication. Upon successful login, the server issues a JWT token that is stored in the client's local storage. This token is included in the Authorization header of subsequent API requests to authenticate the user.

The token contains information about the user, including:
- User ID
- User type (patient or doctor)
- Name
- Email

The middleware/auth.js file contains the authentication middleware that verifies the token and adds the user information to the request object.

## Installation

### Prerequisites
- Node.js and npm
- MySQL

### Backend Setup
1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the MySQL database:
   - Create a database named `employees`
   - Update the database connection configuration in `database.js` if needed

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Register as a patient or doctor
3. Log in with your credentials
4. Use the various features available in your respective dashboard
