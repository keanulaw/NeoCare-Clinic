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
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#193341" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#2c5a71" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#29768a" }, { lightness: 0 }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#406d80" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#406d80" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      { visibility: "on" },
      { color: "#3e606f" },
      { weight: 2 },
      { gamma: 0.84 },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
];

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 10.3157,
  lng: 123.8854, // Example: Manila longitude
};

function Register() {
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);

  const navigate = useNavigate();

  // Use the useLoadScript hook to load the Google Maps API (including the places library)
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBcJDGxtpPyKTJaH8VsPdWq3RkohUNkfd4", // Replace with your API key
    libraries: ["places"],
  });

  const handleMapClick = useCallback((event) => {
    setLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  }, []);

  // Capture the autocomplete instance when it loads.
  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  // When a user selects a place, update the map center.
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place?.geometry) {
        setLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
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
        role: "clinic", // Mark as a clinic account
      });
      navigate("/portal"); // Redirect on successful registration
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
          <p>
            Please select your clinic's location on the map or search for it:
          </p>
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
