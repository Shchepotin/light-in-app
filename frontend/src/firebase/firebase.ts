import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNvwEugffaxI__B2oJ2FvYanQmA6XlJn8",
  authDomain: "light-in-app.firebaseapp.com",
  projectId: "light-in-app",
  storageBucket: "light-in-app.appspot.com",
  messagingSenderId: "1057792452600",
  appId: "1:1057792452600:web:3145091701ea438b5b980d",
  measurementId: "G-6B621F47MR",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
