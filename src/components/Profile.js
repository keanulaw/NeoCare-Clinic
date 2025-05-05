import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { MailIcon, MapPinIcon, UserIcon } from "lucide-react";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUsername = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          console.warn("No user data found for UID:", auth.currentUser.uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsername();
  }, [auth.currentUser]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex justify-center flex justify-center">
        Profile
      </h2>

      {userProfile ? (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto space-y-5">
          <div className="flex items-center space-x-3">
            <UserIcon className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Birth Center Name</p>
              <p className="text-xl font-semibold text-gray-800">
                {userProfile.birthCenterName || "Sample Name"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPinIcon className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-lg font-medium text-gray-700">
                {userProfile.birthCenterAddress || "Sample Address"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MailIcon className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium text-gray-700">
                {userProfile.email || "sample@email.com"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">Loading profile…</p>
      )}
    </div>
  );
};

export default Profile;
