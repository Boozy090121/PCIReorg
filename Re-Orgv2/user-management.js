// User Management System for Quality Re-organization Tool

// User data and authentication
const UserManagement = (function() {
    // Default users (in a real app, this would come from a secure backend)
    const defaultUsers = [
        { id: 'admin', username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
        { id: 'user1', username: 'user1', password: 'user123', name: 'John Doe', role: 'user' }
    ];
    
    // Initialize users in localStorage if not present
    if (!localStorage.getItem('reorg_users')) {
        localStorage.setItem('reorg_users', JSON.stringify(defaultUsers));
    }
    
    // Current user session
    let currentUser = null;
    
    // Load session from localStorage
    const loadSession = () => {
        const sessionData = localStorage.getItem('reorg_current_user');
        if (sessionData) {
            currentUser = JSON.parse(sessionData);
            return true;
        }
        return false;
    };
    
    // Save session to localStorage
    const saveSession = (user) => {
        if (user) {
            // Don't store password in the session
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('reorg_current_user', JSON.stringify(userWithoutPassword));
            currentUser = userWithoutPassword;
        } else {
            localStorage.removeItem('reorg_current_user');
            currentUser = null;
        }
    };
    
    // Login functionality
    const login = (username, password) => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // Delegate to Firebase if it's available
            return { success: false, message: 'Please use email login with Firebase' };
        }
        
        const users = JSON.parse(localStorage.getItem('reorg_users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            saveSession(user);
            return { success: true, user: currentUser };
        }
        
        return { success: false, message: 'Invalid username or password' };
    };
    
    // Logout functionality
    const logout = () => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // Delegate to Firebase if it's available
            return window.FirebaseService.logout();
        }
        
        saveSession(null);
        return { success: true };
    };
    
    // Register new user
    const register = (userData) => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // Delegate to Firebase if it's available
            return { success: false, message: 'Please use email registration with Firebase' };
        }
        
        const users = JSON.parse(localStorage.getItem('reorg_users'));
        
        // Check if username already exists
        if (users.some(u => u.username === userData.username)) {
            return { success: false, message: 'Username already exists' };
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            role: 'user'
        };
        
        // Add to users list
        users.push(newUser);
        localStorage.setItem('reorg_users', JSON.stringify(users));
        
        // Log in as the new user
        saveSession(newUser);
        
        return { success: true, user: currentUser };
    };
    
    // Get current user
    const getCurrentUser = () => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // Delegate to Firebase if it's available
            const firebaseUser = window.FirebaseService.getCurrentUser();
            if (firebaseUser) {
                return firebaseUser;
            }
        }
        
        if (!currentUser) {
            loadSession();
        }
        return currentUser;
    };
    
    // Check if user is logged in
    const isLoggedIn = () => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // Delegate to Firebase if it's available
            return window.FirebaseService.isLoggedIn();
        }
        
        return getCurrentUser() !== null;
    };
    
    // Initialize by loading session
    loadSession();
    
    // Public API
    return {
        login,
        logout,
        register,
        getCurrentUser,
        isLoggedIn
    };
})();

// Data persistence for user settings and layouts
const UserDataPersistence = (function() {
    // Save user-specific data
    const saveUserData = (dataKey, data) => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // For now, Firebase only supports saving the entire app state
            if (dataKey === 'appState') {
                return window.FirebaseService.saveAppState(data);
            }
            // If it's not the app state, continue with localStorage for backwards compatibility
        }
        
        const user = UserManagement.getCurrentUser();
        if (!user) return false;
        
        const storageKey = `reorg_data_${user.id}_${dataKey}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    };
    
    // Load user-specific data
    const loadUserData = async (dataKey, defaultData = null) => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            // For now, Firebase only supports loading the entire app state
            if (dataKey === 'appState') {
                const data = await window.FirebaseService.loadAppState();
                return data || defaultData;
            }
            // If it's not the app state, continue with localStorage for backwards compatibility
        }
        
        const user = UserManagement.getCurrentUser();
        if (!user) return defaultData;
        
        const storageKey = `reorg_data_${user.id}_${dataKey}`;
        const storedData = localStorage.getItem(storageKey);
        
        return storedData ? JSON.parse(storedData) : defaultData;
    };
    
    // Save complete application state
    const saveAppState = (state) => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            return window.FirebaseService.saveAppState(state);
        }
        
        return saveUserData('appState', state);
    };
    
    // Load complete application state
    const loadAppState = () => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            return window.FirebaseService.loadAppState();
        }
        
        return loadUserData('appState');
    };
    
    // Export user data as JSON
    const exportUserData = () => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            return window.FirebaseService.exportUserData();
        }
        
        const user = UserManagement.getCurrentUser();
        if (!user) return null;
        
        // Collect all data keys for this user
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`reorg_data_${user.id}_`)) {
                const dataKey = key.replace(`reorg_data_${user.id}_`, '');
                allData[dataKey] = JSON.parse(localStorage.getItem(key));
            }
        }
        
        return {
            userId: user.id,
            username: user.username,
            name: user.name,
            timestamp: new Date().toISOString(),
            data: allData
        };
    };
    
    // Import user data from JSON
    const importUserData = (jsonData) => {
        // Check if Firebase should be used
        if (window.FirebaseService) {
            return window.FirebaseService.importUserData(jsonData);
        }
        
        const user = UserManagement.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };
        
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Store each data item
            Object.keys(data.data).forEach(dataKey => {
                saveUserData(dataKey, data.data[dataKey]);
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Invalid data format' };
        }
    };
    
    // Public API
    return {
        saveUserData,
        loadUserData,
        saveAppState,
        loadAppState,
        exportUserData,
        importUserData
    };
})();

// Export the modules for use in the main application
window.UserManagement = UserManagement;
window.UserDataPersistence = UserDataPersistence; 