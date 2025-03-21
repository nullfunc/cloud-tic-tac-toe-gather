
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJ_OfUCgYTihwAMePBWz_Jn5-YXxHxP9A",
  authDomain: "tictactoe-lovable.firebaseapp.com",
  projectId: "tictactoe-lovable",
  storageBucket: "tictactoe-lovable.appspot.com",
  messagingSenderId: "354042118867",
  appId: "1:354042118867:web:9c9f7bac83ef0dca5ad0b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
