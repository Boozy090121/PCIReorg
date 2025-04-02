import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initializeFirebase } from './services/firebase';

// Initialize Firebase
initializeFirebase();

// Create root
const root = createRoot(document.getElementById('root'));

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 