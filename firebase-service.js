// Firebase Service for Quality Re-organization Tool

// Firebase module will be defined after Firebase scripts are loaded
let FirebaseService = null;

// Initialize FirebaseService when scripts are loaded
function initializeFirebaseService() {
    // Create a module to handle Firebase operations
    FirebaseService = (function() {
        // References to Firebase services
        let auth;
        let firestore;
        let app;
        let currentUser = null;
        let isInitialized = false;

        // Initialize the Firebase service
        const init = () => {
            try {
                console.log('Initializing Firebase service...');
                
                // Check if Firebase is available
                if (typeof firebase === 'undefined') {
                    console.error('Firebase SDK not loaded - firebase is undefined');
                    throw new Error('Firebase SDK not loaded');
                }

                // Check if Firebase is properly initialized
                try {
                    app = firebase.app();
                    console.log('Firebase app instance obtained successfully');
                } catch (error) {
                    console.error('Firebase app initialization error:', error);
                    throw new Error('Firebase not properly initialized: ' + error.message);
                }

                // Get references to services
                try {
                    auth = firebase.auth();
                    console.log('Firebase Auth service initialized');
                } catch (error) {
                    console.error('Firebase Auth initialization error:', error);
                    throw error;
                }

                try {
                    firestore = firebase.firestore();
                    console.log('Firebase Firestore service initialized');
                } catch (error) {
                    console.error('Firebase Firestore initialization error:', error);
                    throw error;
                }
                
                // Set up auth state listener
                auth.onAuthStateChanged(user => {
                    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
                    if (user) {
                        currentUser = {
                            id: user.uid,
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            username: user.email,
                            role: 'user' // Default role
                        };
                        
                        // Check if the user has admin role
                        firestore.collection('users').doc(user.uid).get()
                            .then(doc => {
                                if (doc.exists && doc.data().role === 'admin') {
                                    currentUser.role = 'admin';
                                    console.log('User role updated to admin');
                                }
                            })
                            .catch(error => {
                                console.error("Error checking user role:", error);
                                // Don't throw here as this is not critical
                            });
                    } else {
                        currentUser = null;
                    }
                }, error => {
                    console.error('Auth state change error:', error);
                });

                isInitialized = true;
                console.log('Firebase service initialized successfully');
                return true;
            } catch (error) {
                console.error("Error initializing Firebase service:", error);
                console.error("Stack trace:", error.stack);
                isInitialized = false;
                return false;
            }
        };

        // Helper function to check initialization
        const checkInitialization = () => {
            if (!isInitialized) {
                console.error('Firebase services not initialized. Current state:', {
                    isInitialized,
                    hasApp: !!app,
                    hasAuth: !!auth,
                    hasFirestore: !!firestore
                });
                throw new Error('Firebase service not properly initialized');
            }
        };

        // Authentication functions
        const login = async (email, password) => {
            try {
                console.log('Attempting login...');
                checkInitialization();
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                console.log('User successfully authenticated');
                
                currentUser = {
                    id: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    username: user.email,
                    role: 'user'
                };
                
                // Get user role from Firestore
                console.log('Fetching user data from Firestore...');
                const userDoc = await firestore.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    currentUser.name = userData.name || currentUser.name;
                    currentUser.role = userData.role || currentUser.role;
                    console.log('User data retrieved from Firestore');
                } else {
                    console.log('Creating new user document in Firestore...');
                    // Create user document if it doesn't exist
                    await firestore.collection('users').doc(user.uid).set({
                        name: currentUser.name,
                        email: currentUser.email,
                        role: currentUser.role,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('New user document created in Firestore');
                }
                
                return { success: true, user: currentUser };
            } catch (error) {
                console.error('Login error:', error);
                console.error('Stack trace:', error.stack);
                return { success: false, message: error.message };
            }
        };

        const register = async (userData) => {
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
                const user = userCredential.user;
                
                // Update user profile
                await user.updateProfile({
                    displayName: userData.name
                });
                
                // Create user document in Firestore
                await firestore.collection('users').doc(user.uid).set({
                    name: userData.name,
                    email: userData.email,
                    role: 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
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

        const logout = async () => {
            try {
                await auth.signOut();
                currentUser = null;
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        };

        const getCurrentUser = () => {
            return currentUser;
        };

        const isLoggedIn = () => {
            return currentUser !== null;
        };

        // Data storage functions
        const saveAppState = async (state) => {
            if (!currentUser) return { success: false, message: 'Not logged in' };
            
            try {
                await firestore.collection('appData').doc(currentUser.id).set({
                    data: state,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        };

        const loadAppState = async () => {
            if (!currentUser) return null;
            
            try {
                const doc = await firestore.collection('appData').doc(currentUser.id).get();
                
                if (doc.exists) {
                    return doc.data().data;
                }
                
                return null;
            } catch (error) {
                console.error("Error loading app state:", error);
                return null;
            }
        };
        
        // Export data to JSON (still useful for backups)
        const exportUserData = async () => {
            if (!currentUser) return null;
            
            try {
                const doc = await firestore.collection('appData').doc(currentUser.id).get();
                
                if (doc.exists) {
                    return {
                        userId: currentUser.id,
                        username: currentUser.email,
                        name: currentUser.name,
                        timestamp: new Date().toISOString(),
                        data: doc.data().data
                    };
                }
                
                return null;
            } catch (error) {
                console.error("Error exporting user data:", error);
                return null;
            }
        };
        
        // Import data from JSON
        const importUserData = async (jsonData) => {
            if (!currentUser) return { success: false, message: 'Not logged in' };
            
            try {
                const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                
                await firestore.collection('appData').doc(currentUser.id).set({
                    data: data.data,
                    importedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    originalUserId: data.userId,
                    originalTimestamp: data.timestamp
                }, { merge: true });
                
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message || 'Invalid data format' };
            }
        };

        // Public API
        return {
            init,
            login,
            register,
            logout,
            getCurrentUser,
            isLoggedIn,
            saveAppState,
            loadAppState,
            exportUserData,
            importUserData
        };
    })();

    // Initialize the service
    FirebaseService.init();
    
    // Make it globally available
    window.FirebaseService = FirebaseService;
    
    // Trigger an event so other scripts know Firebase is ready
    const event = new CustomEvent('firebase-ready');
    document.dispatchEvent(event);
}

// Export initialization function
window.initializeFirebaseService = initializeFirebaseService; 