import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

const customMapStyles = [
  /* same as before */
];
const mapContainerStyle = { height: "400px", width: "100%" };
const defaultCenter = { lat: 10.3157, lng: 123.8854 };

function Register() {
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState({ ...defaultCenter, address: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: ["places"],
  });

  const handleMapClick = useCallback((event) => {
    setLocation((prev) => ({
      ...prev,
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    }));
  }, []);

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place?.geometry) {
        setLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || "",
        });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: clinicName });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        clinicName,
        location,
        role: "clinic",
      });

      navigate("/portal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-2xl font-bold">Register Your Clinic</h2>
      <form onSubmit={handleRegister} className="form">
        {/* Clinic Name */}
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

        {/* Email & Password */}
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

        {/* Location */}
        <div className="form-group">
          <label>Clinic Location:</label>
          <p>Select your clinic's location on the map or search for it:</p>
          {isLoaded ? (
            <>
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <input
                  type="text"
                  placeholder="Search for clinic location"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </Autocomplete>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location}
                zoom={15}
                onClick={handleMapClick}
                options={{
                  styles: customMapStyles,
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                <Marker
                  position={location}
                  draggable={true}
                  onDragEnd={handleMapClick}
                />
              </GoogleMap>
            </>
          ) : (
            <p>Loading map...</p>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <Link to="/login" className="text-[#d47fa6] underline">
          Login here
        </Link>
      </p>
    </div>
  );
}

export default Register;
