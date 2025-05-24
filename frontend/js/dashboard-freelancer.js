document.addEventListener('DOMContentLoaded', function() {
  // Check if logged in
  redirectIfNotLoggedIn();
  
  // Setup user info and logout
  populateUserInfo();
  setupLogout();
  
  // Check if user is a freelancer
  const user = getCurrentUser();
  if (user && user.role !== 'freelancer') {
    window.location.href = 'dashboard-client.html';
  }
  
  // DOM elements
  const availableProjectsElement = document.getElementById('available-projects');
  const totalProposalsElement = document.getElementById('total-proposals');
  const acceptedProposalsElement = document.getElementById('accepted-proposals');
  const pendingProposalsElement = document.getElementById('pending-proposals');
  const recentProjectsElement = document.getElementById('recent-projects');
  const recentProposalsElement = document.getElementById('recent-proposals');
  const allProjectsElement = document.getElementById('all-projects');
  const allProposalsElement = document.getElementById('all-proposals');
  
  // Form elements
  const submitProposalForm = document.getElementById('submit-proposal-form');
  
  // Load data
  loadDashboardData();
  
  // Event listeners
  if (submitProposalForm) {
    submitProposalForm.addEventListener('submit', handleSubmitProposal);
  }
  
  // Load dashboard data
  async function loadDashboardData() {
    try {
      // Get available projects
      const projects = await fetchAvailableProjects();
      
      // Update available projects count
      if (availableProjectsElement) {
        availableProjectsElement.textContent = projects.length;
      }
      
      // Display recent projects
      if (recentProjectsElement) {
        displayRecentProjects(projects);
      }
      
      // Display all projects
      if (allProjectsElement) {
        displayAllProjects(projects);
      }
      
      // Get freelancer's proposals
      const proposals = await fetchFreelancerProposals();
      
      // Update proposals counts
      if (totalProposalsElement) {
        totalProposalsElement.textContent = proposals.length;
      }
      
      if (acceptedProposalsElement) {
        const acceptedCount = proposals.filter(p => p.status === 'Accepted').length;
        acceptedProposalsElement.textContent = acceptedCount;
      }
      
      if (pendingProposalsElement) {
        const pendingCount = proposals.filter(p => p.status === 'Pending').length;
        pendingProposalsElement.textContent = pendingCount;
      }
      
      // Display recent proposals
      if (recentProposalsElement) {
        displayRecentProposals(proposals);
      }
      
      // Display all proposals
      if (allProposalsElement) {
        displayAllProposals(proposals);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
  
  // Fetch available projects
  async function fetchAvailableProjects() {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }
  
  // Fetch freelancer's proposals
  async function fetchFreelancerProposals() {
    try {
      const response = await fetch(`${API_URL}/proposals/freelancer`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return [];
    }
  }
  
  // Display recent projects
  function displayRecentProjects(projects) {
    // Get most recent 3 projects
    const recentProjects = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    
    if (recentProjects.length === 0) {
      recentProjectsElement.innerHTML = '<p class="no-data">No available projects at the moment.</p>';
      return;
    }
    
    recentProjectsElement.innerHTML = recentProjects.map(project => `
      <div class="project-item" data-id="${project._id}" data-status="${project.status}">
        <div class="project-item-header">
          <h3>${project.title}</h3>
          <span class="status-badge ${getStatusClass(project.status)}">${project.status}</span>
        </div>
        <div class="project-item-details">
          <p>${project.description}</p>
        </div>
        <div class="project-item-meta">
          <span>${formatCurrency(project.budget)}</span>
          <span><i class="fas fa-clock"></i> ${calculateDaysLeft(project.deadline)} days left</span>
        </div>
        <div class="project-item-footer">
          <button class="btn btn-primary btn-sm view-project-btn" data-id="${project._id}">
            View Project
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const projectId = this.getAttribute('data-id');
        openProjectModal(projectId);
      });
    });
  }
  
  // Display all projects
  function displayAllProjects(projects) {
    if (projects.length === 0) {
      allProjectsElement.innerHTML = '<p class="no-data">No available projects at the moment.</p>';
      return;
    }
    
    allProjectsElement.innerHTML = projects.map(project => `
      <div class="project-item" data-id="${project._id}" data-status="${project.status}">
        <div class="project-item-header">
          <h3>${project.title}</h3>
          <span class="status-badge ${getStatusClass(project.status)}">${project.status}</span>
        </div>
        <div class="project-item-details">
          <p>${project.description}</p>
        </div>
        <div class="project-item-meta">
          <span>${formatCurrency(project.budget)}</span>
          <span><i class="fas fa-clock"></i> ${calculateDaysLeft(project.deadline)} days left</span>
        </div>
        <div class="project-item-footer">
          <button class="btn btn-primary btn-sm view-project-btn" data-id="${project._id}">
            View Project
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const projectId = this.getAttribute('data-id');
        openProjectModal(projectId);
      });
    });
  }
  
  // Display recent proposals
  function displayRecentProposals(proposals) {
    // Get most recent 3 proposals
    const recentProposals = proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    
    if (recentProposals.length === 0) {
      recentProposalsElement.innerHTML = '<p class="no-data">You haven\'t submitted any proposals yet.</p>';
      return;
    }
    
    recentProposalsElement.innerHTML = recentProposals.map(proposal => `
      <div class="proposal-item" data-id="${proposal._id}" data-status="${proposal.status}">
        <div class="proposal-item-header">
          <h3>${proposal.project.title}</h3>
          <span class="status-badge ${getStatusClass(proposal.status)}">${proposal.status}</span>
        </div>
        <div class="proposal-item-details">
          <p>${proposal.message}</p>
        </div>
        <div class="proposal-item-meta">
          <span>Your Bid: ${formatCurrency(proposal.expectedBudget)}</span>
          <span>Submitted: ${formatDate(proposal.createdAt)}</span>
        </div>
        <div class="proposal-item-footer">
          <button class="btn btn-primary btn-sm view-project-btn" data-id="${proposal.project._id}">
            View Project
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const projectId = this.getAttribute('data-id');
        openProjectModal(projectId);
      });
    });
  }
  
  // Display all proposals
  function displayAllProposals(proposals) {
    if (proposals.length === 0) {
      allProposalsElement.innerHTML = '<p class="no-data">You haven\'t submitted any proposals yet.</p>';
      return;
    }
    
    allProposalsElement.innerHTML = proposals.map(proposal => `
      <div class="proposal-item" data-id="${proposal._id}" data-status="${proposal.status}">
        <div class="proposal-item-header">
          <h3>${proposal.project.title}</h3>
          <span class="status-badge ${getStatusClass(proposal.status)}">${proposal.status}</span>
        </div>
        <div class="proposal-item-details">
          <p>${proposal.message}</p>
        </div>
        <div class="proposal-item-meta">
          <span>Your Bid: ${formatCurrency(proposal.expectedBudget)}</span>
          <span>Project Budget: ${formatCurrency(proposal.project.budget)}</span>
        </div>
        <div class="proposal-item-footer">
          <button class="btn btn-primary btn-sm view-project-btn" data-id="${proposal.project._id}">
            View Project
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const projectId = this.getAttribute('data-id');
        openProjectModal(projectId);
      });
    });
  }
  
  // Open project modal
  async function openProjectModal(projectId) {
    try {
      // Fetch project details
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }
      
      const project = await response.json();
      
      // Update modal content
      document.getElementById('view-project-title').textContent = project.title;
      document.getElementById('view-project-description').textContent = project.description;
      document.getElementById('view-project-budget').textContent = formatCurrency(project.budget);
      document.getElementById('view-project-deadline').textContent = formatDate(project.deadline);
      
      // Update status badge
      const statusElement = document.getElementById('view-project-status');
      statusElement.innerHTML = `<span class="status-badge ${getStatusClass(project.status)}">${project.status}</span>`;
      
      // Update skills
      const skillsElement = document.getElementById('view-project-skills');
      if (project.skills && project.skills.length > 0) {
        skillsElement.innerHTML = project.skills.map(skill => `<span>${skill}</span>`).join('');
      } else {
        skillsElement.innerHTML = '<p>No specific skills required</p>';
      }
      
      // Check if freelancer has already submitted a proposal
      const proposalsResponse = await fetch(`${API_URL}/proposals/freelancer`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!proposalsResponse.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      const proposals = await proposalsResponse.json();
      const existingProposal = proposals.find(p => p.project._id === projectId);
      
      // Update proposal status section
      const proposalStatusSection = document.getElementById('proposal-current-status');
      if (existingProposal) {
        proposalStatusSection.innerHTML = `
          <div class="status-info">
            <span class="status-badge ${getStatusClass(existingProposal.status)}">${existingProposal.status}</span>
            <p>You submitted a proposal for ${formatCurrency(existingProposal.expectedBudget)}</p>
          </div>
        `;
      } else {
        proposalStatusSection.innerHTML = `
          <p>You haven't submitted a proposal for this project yet.</p>
        `;
      }
      
      // Update submit button based on whether a proposal exists
      const submitBtn = document.getElementById('submit-proposal-btn');
      if (existingProposal) {
        submitBtn.style.display = 'none';
      } else {
        submitBtn.style.display = 'inline-flex';
        submitBtn.setAttribute('data-project-id', projectId);
        submitBtn.setAttribute('data-project-budget', project.budget);
        
        // Add event listener to submit proposal button
        submitBtn.addEventListener('click', function() {
          openSubmitProposalModal(this.getAttribute('data-project-id'), this.getAttribute('data-project-budget'));
        });
      }
      
      // Show modal
      document.getElementById('view-project-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
      
    } catch (error) {
      console.error('Error opening project modal:', error);
    }
  }
  
  // Open submit proposal modal
  function openSubmitProposalModal(projectId, projectBudget) {
    // Update form
    document.getElementById('proposal-project-id').value = projectId;
    
    // Set budget placeholder
    document.getElementById('proposal-budget').placeholder = `Project budget: ${formatCurrency(projectBudget)}`;
    
    // Close project modal
    document.getElementById('view-project-modal').classList.remove('active');
    
    // Show submit proposal modal
    document.getElementById('submit-proposal-modal').classList.add('active');
  }
  
  // Handle submit proposal form
  async function handleSubmitProposal(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('proposal-project-id').value;
    const message = document.getElementById('proposal-message').value;
    const expectedBudget = document.getElementById('proposal-budget').value;
    
    // Basic validation
    if (!projectId || !message || !expectedBudget) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = submitProposalForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      submitBtn.disabled = true;
      
      // Make API request
      const response = await fetch(`${API_URL}/proposals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          projectId,
          message,
          expectedBudget: Number(expectedBudget)
        })
      });
      
      // Reset button state
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proposal');
      }
      
      // Close modal and reset form
      document.getElementById('submit-proposal-modal').classList.remove('active');
      document.body.style.overflow = '';
      submitProposalForm.reset();
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  }
});