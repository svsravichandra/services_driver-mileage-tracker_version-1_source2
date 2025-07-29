// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAglUBXWcz9XtY-mRBkZwdNULsLAulyGx0",
    authDomain: "driver-milage-tracker-m1.firebaseapp.com",
    projectId: "driver-milage-tracker-m1",
    storageBucket: "driver-milage-tracker-m1.appspot.com",
    messagingSenderId: "603658963582",
    appId: "1:603658963582:web:2653ec8378470c1d38e62f"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };