import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

let app;
let analytics;
let db;
let auth;
let currentUser = null;

export const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Set up auth state listener
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = {
          id: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          username: user.email,
          role: 'user' // Default role
        };

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            // Create the user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              createdAt: serverTimestamp()
            });
          } else {
            // Update the current user with stored data
            const userData = userDoc.data();
            currentUser.name = userData.name || currentUser.name;
            currentUser.role = userData.role || currentUser.role;
          }
        } catch (error) {
          console.error('Error managing user document:', error);
        }
      } else {
        currentUser = null;
      }
    });

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    currentUser = {
      id: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      username: user.email,
      role: 'user'
    };
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentUser.name = userData.name || currentUser.name;
        currentUser.role = userData.role || currentUser.role;
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error managing user document:', error);
    }
    
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const register = async (userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, {
      displayName: userData.name
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: userData.name,
      email: userData.email,
      role: 'user',
      createdAt: serverTimestamp()
    });
    
    currentUser = {
      id: user.uid,
      name: userData.name,
      email: userData.email,
      username: userData.email,
      role: 'user'
    };
    
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    currentUser = null;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCurrentUser = () => currentUser;
export const isLoggedIn = () => currentUser !== null;
export const getFirebaseApp = () => app;
export const getFirebaseDB = () => db;
export const getFirebaseAuth = () => auth;
export const getFirebaseAnalytics = () => analytics; 