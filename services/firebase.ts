// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAIKEL4H-vdavjiPsX468bG60Ng1DQxNC0",
    authDomain: "eng-wharf-467405-f5.firebaseapp.com",
    projectId: "eng-wharf-467405-f5",
    storageBucket: "eng-wharf-467405-f5.appspot.com",
    messagingSenderId: "870456171124",
    appId: "1:870456171124:web:166a5729eacc553dd0cf21",
    measurementId: "G-H36GZ9Y4FB"
  
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };