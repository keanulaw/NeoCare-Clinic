import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

const customMapStyles = []; // Optional: Insert custom styles here
const mapContainerStyle = { height: "300px", width: "100%" };
const defaultCenter = { lat: 10.3157, lng: 123.8854 };

export default function Register() {
  const [birthCenterName, setBirthCenterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthCenterAddress, setBirthCenterAddress] = useState("");
  const [location, setLocation] = useState(defaultCenter);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBcJDGxtpPyKTJaH8VsPdWq3RkohUNkfd4",
    libraries: ["places"],
  });

  const geocodeLatLng = useCallback((latLng) => {
    if (!window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status !== "OK" || !results[0]) {
        console.warn("Geocoder failed:", status);
        return;
      }
      const formattedAddress = results[0].formatted_address;

      service.nearbySearch(
        { location: latLng, radius: 500, type: "hospital" },
        (placesResults, placesStatus) => {
          const name =
            placesStatus === window.google.maps.places.PlacesServiceStatus.OK &&
            placesResults.length > 0
              ? placesResults[0].name
              : formattedAddress;

          setBirthCenterName(name);
          setBirthCenterAddress(formattedAddress);
        }
      );
    });
  }, []);

  const handleMapClick = useCallback(
    (e) => {
      const newLoc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setLocation(newLoc);
      geocodeLatLng(newLoc);
    },
    [geocodeLatLng]
  );

  const onLoad = (auto) => setAutocomplete(auto);

  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.formatted_address) {
      return alert("Please select a place from the dropdown.");
    }
    const newLoc = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setLocation(newLoc);
    setBirthCenterAddress(place.formatted_address);
    setBirthCenterName(place.name || place.formatted_address);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!birthCenterName || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (!birthCenterAddress) {
      return setError(
        "Please pick your birth center on the map or via search."
      );
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(user, { displayName: birthCenterName });

      await setDoc(doc(db, "users", user.uid), {
        role: "clinic",
        email,
        birthCenterName,
        birthCenterAddress,
        birthCenterLocation: location,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "clinics", user.uid), {
        birthCenterName,
        email,
        birthCenterAddress,
        birthCenterLocation: location,
        createdAt: serverTimestamp(),
      });

      navigate("/portal");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2C2DE] to-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 z-10">
        <div className="text-center mb-6">
          <img
            src="/Logo.png"
            alt="NeoCare Logo"
            className="mx-auto w-20 mb-2"
          />
          <h2 className="text-3xl font-bold text-[#DA79B9]">
            Register Your Birth Center
          </h2>
          <p className="text-gray-600 mt-1">
            Join NeoCare and support parents throughout their journey.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Autocomplete + Map */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Birth Center Location
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Search or click on the map to set your location
            </p>
            {isLoaded ? (
              <>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Search location"
                    className="w-full px-4 py-2 mb-2 border rounded-lg"
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
                    draggable
                    onDragEnd={handleMapClick}
                  />
                </GoogleMap>
              </>
            ) : (
              <p>Loading map…</p>
            )}
            {birthCenterName && (
              <p className="mt-2 text-sm text-gray-600">
                Selected center: <em>{birthCenterName}</em>
              </p>
            )}
            {birthCenterAddress && (
              <p className="text-sm text-gray-500">
                Address: <em>{birthCenterAddress}</em>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email here"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DA79B9] outline-none"
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DA79B9] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DA79B9] outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#DA79B9] hover:bg-[#c760a3] text-white font-semibold rounded-lg transition duration-200"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#DA79B9] underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
