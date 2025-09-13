// Firebase configuration and functions
const firebaseConfig = {
  apiKey: "AIzaSyBlQI16Nmx5oo3VzyCDEb6V4M2cH9Bbwc8",
  authDomain: "mindmapping-58435.firebaseapp.com",
  databaseURL: "https://mindmapping-58435-default-rtdb.firebaseio.com",
  projectId: "mindmapping-58435",
  storageBucket: "mindmapping-58435.firebasestorage.app",
  messagingSenderId: "1059085761579",
  appId: "1:1059085761579:web:5422cefb56f5989af7be6e",
  measurementId: "G-9F7EZZ2C9T"
};

// Initialize Firebase
let firebaseApp;
let database;
let auth;

function firebaseInit() {
  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    auth = firebase.auth();
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Authentication functions
function checkAuthState() {
  if (!auth) return;
  
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'block';
      loadUserMaps(user.uid);
    } else {
      // User is signed out
      document.getElementById('auth-container').style.display = 'flex';
      document.getElementById('logoutBtn').style.display = 'none';
    }
  });
}

function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function signup(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function logout() {
  return auth.signOut();
}

function loginAsGuest() {
  // Create anonymous user
  return auth.signInAnonymously();
}

// Database functions
function saveMindMap(userId, mapId, data) {
  return database.ref(`users/${userId}/mindMaps/${mapId}`).set({
    data: data,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
}

function loadMindMap(userId, mapId) {
  return database.ref(`users/${userId}/mindMaps/${mapId}`).once('value');
}

function getUserMaps(userId) {
  return database.ref(`users/${userId}/mindMaps`).once('value');
}

function deleteMindMap(userId, mapId) {
  return database.ref(`users/${userId}/mindMaps/${mapId}`).remove();
}