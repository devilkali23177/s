// Main application file
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase
  firebaseInit();
  
  // Initialize UI components
  initUI();
  
  // Initialize node management
  initNodeManager();
  
  // Initialize layout manager
  initLayoutManager();
  
  // Check if user is logged in
  checkAuthState();
});