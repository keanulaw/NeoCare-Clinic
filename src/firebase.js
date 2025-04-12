import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-v_mJdtVPXtHzZDabFUsKKOI_B_zrrdA",
  authDomain: "neocare-2434d.firebaseapp.com",
  projectId: "neocare-2434d",
  storageBucket: "neocare-2434d.firebasestorage.app",
  messagingSenderId: "398145643581",
  appId: "1:398145643581:web:24a113975ee6c198d9b654",
  measurementId: "G-BNZ2F5S6S4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth, db };
