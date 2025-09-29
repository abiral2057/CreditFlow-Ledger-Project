
'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  "projectId": "studio-8187531250-67937",
  "appId": "1:376955380025:web:f6c8250c7c5b8d9f2a88e8",
  "apiKey": "AIzaSyDB-U6-uKVnCGi8g5aFvfafWh38X01VLeQ",
  "authDomain": "studio-8187531250-67937.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "376955380025"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
