document.addEventListener('DOMContentLoaded', function() {
  // API URL
  const API_URL = 'http://localhost:5000/api';
  
  // Check if already logged in
  if (isLoggedIn()) {
    redirectToDashboard();
  }
  
  // Handle login form submission
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Basic validation
      if (!email || !password) {
        showError('All fields are required');
        return;
      }
      
      try {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        // Make API request
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        });
        
        const data = await response.json();
        
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Handle response
        if (!response.ok) {
          showError(data.message || 'Login failed');
          return;
        }
        
        // Store user data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        }));
        
        // Redirect to appropriate dashboard
        if (data.role === 'client') {
          window.location.href = 'dashboard-client.html';
        } else {
          window.location.href = 'dashboard-freelancer.html';
        }
        
      } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        
        // Reset button state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Log In';
        submitBtn.disabled = false;
      }
    });
  }
  
  // Handle registration form submission
  const registerForm = document.getElementById('register-form');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.querySelector('input[name="role"]:checked')?.value;
      const terms = document.getElementById('terms').checked;
      
      // Basic validation
      if (!name || !email || !password || !role) {
        showError('All fields are required');
        return;
      }
      
      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }
      
      if (!terms) {
        showError('You must agree to the Terms of Service');
        return;
      }
      
      try {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        
        // Make API request
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role
          })
        });
        
        const data = await response.json();
        
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Handle response
        if (!response.ok) {
          showError(data.message || 'Registration failed');
          return;
        }
        
        // Store user data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        }));
        
        // Redirect to appropriate dashboard
        if (data.role === 'client') {
          window.location.href = 'dashboard-client.html';
        } else {
          window.location.href = 'dashboard-freelancer.html';
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        showError('An error occurred. Please try again.');
        
        // Reset button state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Create Account';
        submitBtn.disabled = false;
      }
    });
  }
  
  // Helper function to show error messages
  function showError(message) {
    const errorElement = document.getElementById('error-message');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }
  
  // Helper functions
  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }
  
  function redirectToDashboard() {
    const userJson = localStorage.getItem('user');
    
    if (userJson) {
      const user = JSON.parse(userJson);
      
      if (user.role === 'client') {
        window.location.href = 'dashboard-client.html';
      } else {
        window.location.href = 'dashboard-freelancer.html';
      }
    }
  }
});