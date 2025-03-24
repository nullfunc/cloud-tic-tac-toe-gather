
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJ_OfUCgYTihwAMePBWz_Jn5-YXxHxP9A",
  authDomain: "tictactoe-lovable.firebaseapp.com",
  projectId: "tictactoe-lovable",
  storageBucket: "tictactoe-lovable.appspot.com",
  messagingSenderId: "354042118867",
  appId: "1:354042118867:web:9c9f7bac83ef0dca5ad0b5"
};

// Initialize Firebase with error handling
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Improve Firestore performance with settings
  db.settings = {
    cacheSizeBytes: 1048576 * 10, // 10 MB
    ignoreUndefinedProperties: true,
  };
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  toast({
    title: "Connection Error",
    description: "Failed to connect to the game server. Please refresh the page or try again later.",
    variant: "destructive",
  });
}

// Use emulators for local development if needed
if (window.location.hostname === "localhost") {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log("Connected to Firebase emulators");
  } catch (error) {
    console.warn("Failed to connect to emulators:", error);
  }
}

export { app, db, auth };
