import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  height: "400px",
  width: "100%"
};

const defaultCenter = {
    lat: 10.3157,
    lng: 123.8854, // Example: Manila longitude
};

function Register() {
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleMapClick = useCallback((event) => {
    setLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  }, []);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validations
    if (!clinicName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: clinicName });
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        clinicName,
        location,
        role: "clinic"  // Mark as a clinic account
      });
      
      navigate('/portal'); // Redirect to the main portal on successful registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Register Your Clinic</h2>
      <form onSubmit={handleRegister} className="form">
        <div className="form-group">
          <label htmlFor="clinicName">Clinic Name:</label>
          <input 
            id="clinicName"
            type="text"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder="Enter your clinic name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input 
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
          />
        </div>
        <div className="form-group">
          <label>Clinic Location:</label>
          <p>Please select your clinic's location on the map:</p>
          <LoadScript googleMapsApiKey="AIzaSyBcJDGxtpPyKTJaH8VsPdWq3RkohUNkfd4">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={location}
              zoom={15}
              onClick={handleMapClick}
            >
              <Marker 
                position={location} 
                draggable={true} 
                onDragEnd={handleMapClick} 
              />
            </GoogleMap>
          </LoadScript>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
}

export default Register;
