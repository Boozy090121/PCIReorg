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

        // Initialize the Firebase service
        const init = () => {
            try {
                // Get references to services from the initialized Firebase app
                app = firebase.app();
                auth = firebase.auth();
                firestore = firebase.firestore();
                
                // Set up auth state listener
                auth.onAuthStateChanged(user => {
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
                                }
                            })
                            .catch(error => console.error("Error checking user role:", error));
                    } else {
                        currentUser = null;
                    }
                });
                
                return true;
            } catch (error) {
                console.error("Error initializing Firebase service:", error);
                return false;
            }
        };

        // Authentication functions
        const login = async (email, password) => {
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                currentUser = {
                    id: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    username: user.email,
                    role: 'user'
                };
                
                // Get user role from Firestore
                const userDoc = await firestore.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    currentUser.name = userData.name || currentUser.name;
                    currentUser.role = userData.role || currentUser.role;
                } else {
                    // Create user document if it doesn't exist
                    await firestore.collection('users').doc(user.uid).set({
                        name: currentUser.name,
                        email: currentUser.email,
                        role: currentUser.role,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                return { success: true, user: currentUser };
            } catch (error) {
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