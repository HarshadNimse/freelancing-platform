// Toggle mobile menu
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Sidebar toggle (dashboard pages)
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
  
  // Navigation for dashboard tabs
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  const sections = document.querySelectorAll('.dashboard-content .section');
  
  if (navLinks.length > 0 && sections.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(link => link.parentElement.classList.remove('active'));
        
        // Add active class to clicked link
        this.parentElement.classList.add('active');
        
        // Hide all sections
        sections.forEach(section => section.classList.add('hidden'));
        
        // Show target section
        const targetId = this.getAttribute('href').substring(1);
        document.getElementById(`${targetId}-section`).classList.remove('hidden');
        
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768 && sidebar) {
          sidebar.classList.remove('active');
        }
      });
    });
  }
  
  // Filter dropdowns
  const filterDropdowns = document.querySelectorAll('.filter-dropdown');
  
  if (filterDropdowns.length > 0) {
    filterDropdowns.forEach(dropdown => {
      const btn = dropdown.querySelector('button');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      btn.addEventListener('click', function() {
        menu.classList.toggle('active');
      });
      
      // Close when clicking outside
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
      
      // Filter functionality
      const filterLinks = menu.querySelectorAll('a');
      filterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          menu.classList.remove('active');
          
          const filter = this.getAttribute('data-filter');
          const items = document.querySelectorAll('.project-item, .proposal-item');
          
          items.forEach(item => {
            const status = item.getAttribute('data-status');
            
            if (filter === 'all' || status === filter) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
    });
  }
  
  // Modal functionality
  const modals = document.querySelectorAll('.modal');
  const modalOpenBtns = document.querySelectorAll('[data-modal]');
  const modalCloseBtns = document.querySelectorAll('.modal-close, .modal-close-btn');
  
  if (modals.length > 0) {
    // Open modal
    modalOpenBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
    
    // Close modal
    modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close when clicking outside
    modals.forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }
  
  // Password toggle visibility
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  if (passwordToggles.length > 0) {
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }
  
  // Pre-select role from URL parameter
  const registerForm = document.getElementById('register-form');
  
  if (registerForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    
    if (role === 'client' || role === 'freelancer') {
      document.getElementById(role).checked = true;
    }
  }
});

// Helper functions
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

function calculateDaysLeft(deadlineString) {
  const deadline = new Date(deadlineString);
  const today = new Date();
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

function getStatusClass(status) {
  switch(status) {
    case 'Pending':
      return 'pending';
    case 'Approved':
      return 'approved';
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    case 'Accepted':
      return 'accepted';
    case 'Rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

// API URL
const API_URL = 'http://localhost:5000/api';

// Handle API errors
function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
  
  return error.response ? error.response.data : { message: 'Network error. Please try again.' };
}

// Get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Get auth headers
function getAuthHeaders() {
  const token = getToken();
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Get current user
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Redirect if not logged in
function redirectIfNotLoggedIn() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// Redirect to appropriate dashboard
function redirectToDashboard() {
  const user = getCurrentUser();
  
  if (user) {
    if (user.role === 'client') {
      window.location.href = 'dashboard-client.html';
    } else {
      window.location.href = 'dashboard-freelancer.html';
    }
  }
}

// Logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }
}

// Populate user info in dashboard
function populateUserInfo() {
  const user = getCurrentUser();
  const userNameElement = document.getElementById('user-name');
  
  if (user && userNameElement) {
    userNameElement.textContent = user.name;
  }
}