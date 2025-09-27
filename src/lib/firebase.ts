
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB6ddGqje3MO0y5ponLav30HEtblp1f79Q",
  authDomain: "studio-6226708104-3fbd8.firebaseapp.com",
  projectId: "studio-6226708104-3fbd8",
  storageBucket: "studio-6226708104-3fbd8.appspot.com",
  messagingSenderId: "825094720156",
  appId: "1:825094720156:web:12345",
  measurementId: "G-12345"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
