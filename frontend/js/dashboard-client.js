document.addEventListener('DOMContentLoaded', function() {
  // Check if logged in
  redirectIfNotLoggedIn();
  
  // Setup user info and logout
  populateUserInfo();
  setupLogout();
  
  // Check if user is a client
  const user = getCurrentUser();
  if (user && user.role !== 'client') {
    window.location.href = 'dashboard-freelancer.html';
  }
  
  // DOM elements
  const totalProjectsElement = document.getElementById('total-projects');
  const totalProposalsElement = document.getElementById('total-proposals');
  const activeProjectsElement = document.getElementById('active-projects');
  const completedProjectsElement = document.getElementById('completed-projects');
  const recentProjectsElement = document.getElementById('recent-projects');
  const recentProposalsElement = document.getElementById('recent-proposals');
  const allProjectsElement = document.getElementById('all-projects');
  const allProposalsElement = document.getElementById('all-proposals');
  
  // Create project elements
  const createProjectBtn = document.getElementById('create-project-btn');
  const createProjectBtn2 = document.getElementById('create-project-btn-2');
  const createProjectModal = document.getElementById('create-project-modal');
  const createProjectForm = document.getElementById('create-project-form');
  
  // Load data
  loadDashboardData();
  
  // Event listeners
  if (createProjectBtn) {
    createProjectBtn.addEventListener('click', function() {
      createProjectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (createProjectBtn2) {
    createProjectBtn2.addEventListener('click', function() {
      createProjectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (createProjectForm) {
    createProjectForm.addEventListener('submit', handleCreateProject);
  }
  
  // Load dashboard data
  async function loadDashboardData() {
    try {
      // Get projects
      const projects = await fetchProjects();
      
      // Update summary counts
      if (totalProjectsElement) {
        totalProjectsElement.textContent = projects.length;
      }
      
      if (activeProjectsElement) {
        const activeCount = projects.filter(p => p.status === 'Approved').length;
        activeProjectsElement.textContent = activeCount;
      }
      
      if (completedProjectsElement) {
        const completedCount = projects.filter(p => p.status === 'Completed').length;
        completedProjectsElement.textContent = completedCount;
      }
      
      // Display recent projects
      if (recentProjectsElement) {
        displayRecentProjects(projects);
      }
      
      // Display all projects
      if (allProjectsElement) {
        displayAllProjects(projects);
      }
      
      // Get proposals for all projects
      let allProposals = [];
      for (const project of projects) {
        const proposals = await fetchProjectProposals(project._id);
        allProposals = [...allProposals, ...proposals.map(p => ({ ...p, project }))];
      }
      
      // Update proposals count
      if (totalProposalsElement) {
        totalProposalsElement.textContent = allProposals.length;
      }
      
      // Display recent proposals
      if (recentProposalsElement) {
        displayRecentProposals(allProposals);
      }
      
      // Display all proposals by project
      if (allProposalsElement) {
        displayAllProposalsByProject(projects, allProposals);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
  
  // Fetch client's projects
  async function fetchProjects() {
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
  
  // Fetch proposals for a project
  async function fetchProjectProposals(projectId) {
    try {
      const response = await fetch(`${API_URL}/proposals/project/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching proposals for project ${projectId}:`, error);
      return [];
    }
  }
  
  // Display recent projects
  function displayRecentProjects(projects) {
    // Get most recent 3 projects
    const recentProjects = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    
    if (recentProjects.length === 0) {
      recentProjectsElement.innerHTML = '<p class="no-data">No projects yet. Create your first project!</p>';
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
      allProjectsElement.innerHTML = '<p class="no-data">No projects yet. Create your first project!</p>';
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
      recentProposalsElement.innerHTML = '<p class="no-data">No proposals received yet.</p>';
      return;
    }
    
    recentProposalsElement.innerHTML = recentProposals.map(proposal => `
      <div class="proposal-item" data-id="${proposal._id}" data-status="${proposal.status}">
        <div class="proposal-item-header">
          <h3>${proposal.project.title}</h3>
          <span class="status-badge ${getStatusClass(proposal.status)}">${proposal.status}</span>
        </div>
        <div class="proposal-item-details">
          <p><strong>From:</strong> ${proposal.freelancer.name}</p>
          <p>${proposal.message}</p>
        </div>
        <div class="proposal-item-meta">
          <span>Budget: ${formatCurrency(proposal.expectedBudget)}</span>
          <span>Received: ${formatDate(proposal.createdAt)}</span>
        </div>
        <div class="proposal-item-footer">
          <button class="btn btn-primary btn-sm view-proposal-btn" 
            data-id="${proposal._id}" 
            data-project-id="${proposal.project._id}"
            data-project-title="${proposal.project.title}"
            data-freelancer-name="${proposal.freelancer.name}"
            data-freelancer-skills="${proposal.freelancer.skills || ''}"
            data-message="${proposal.message}"
            data-budget="${proposal.expectedBudget}"
            data-status="${proposal.status}">
            View Details
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-proposal-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        openProposalModal(this);
      });
    });
  }
  
  // Display all proposals grouped by project
  function displayAllProposalsByProject(projects, allProposals) {
    if (allProposals.length === 0) {
      allProposalsElement.innerHTML = '<p class="no-data">No proposals received yet.</p>';
      return;
    }
    
    // Group proposals by project
    const projectsWithProposals = projects.filter(project => {
      return allProposals.some(proposal => proposal.project._id === project._id);
    });
    
    allProposalsElement.innerHTML = projectsWithProposals.map(project => {
      const projectProposals = allProposals.filter(p => p.project._id === project._id);
      
      return `
        <div class="project-with-proposals">
          <div class="project-header">
            <div class="project-header-content">
              <h3>${project.title}</h3>
              <span class="status-badge ${getStatusClass(project.status)}">${project.status}</span>
            </div>
          </div>
          <div class="proposals-container">
            ${projectProposals.map(proposal => `
              <div class="proposal-item" data-id="${proposal._id}" data-status="${proposal.status}">
                <div class="proposal-item-header">
                  <h3>${proposal.freelancer.name}</h3>
                  <span class="status-badge ${getStatusClass(proposal.status)}">${proposal.status}</span>
                </div>
                <div class="proposal-item-details">
                  <p>${proposal.message}</p>
                </div>
                <div class="proposal-item-meta">
                  <span>Budget: ${formatCurrency(proposal.expectedBudget)}</span>
                  <span>Received: ${formatDate(proposal.createdAt)}</span>
                </div>
                <div class="proposal-item-footer">
                  <button class="btn btn-primary btn-sm view-proposal-btn" 
                    data-id="${proposal._id}" 
                    data-project-id="${proposal.project._id}"
                    data-project-title="${proposal.project.title}"
                    data-freelancer-name="${proposal.freelancer.name}"
                    data-freelancer-skills="${proposal.freelancer.skills || ''}"
                    data-message="${proposal.message}"
                    data-budget="${proposal.expectedBudget}"
                    data-status="${proposal.status}">
                    View Details
                  </button>
                </div>
              </div>
            `).join('') || '<p class="no-data">No proposals for this project yet.</p>'}
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-proposal-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        openProposalModal(this);
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
      
      // Fetch proposals for this project
      const proposalsResponse = await fetch(`${API_URL}/proposals/project/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!proposalsResponse.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      const proposals = await proposalsResponse.json();
      
      // Update proposals section
      const proposalsElement = document.getElementById('view-project-proposals');
      if (proposals.length > 0) {
        proposalsElement.innerHTML = proposals.map(proposal => `
          <div class="proposal-mini-item">
            <div class="proposal-mini-header">
              <h4>${proposal.freelancer.name}</h4>
              <span class="status-badge ${getStatusClass(proposal.status)}">${proposal.status}</span>
            </div>
            <p class="proposal-mini-message">${proposal.message}</p>
            <div class="proposal-mini-footer">
              <span>${formatCurrency(proposal.expectedBudget)}</span>
              <button class="btn btn-sm btn-outline view-proposal-btn" 
                data-id="${proposal._id}" 
                data-project-id="${project._id}"
                data-project-title="${project.title}"
                data-freelancer-name="${proposal.freelancer.name}"
                data-freelancer-skills="${proposal.freelancer.skills || ''}"
                data-message="${proposal.message}"
                data-budget="${proposal.expectedBudget}"
                data-status="${proposal.status}">
                View
              </button>
            </div>
          </div>
        `).join('');
        
        // Add event listeners to proposal view buttons
        proposalsElement.querySelectorAll('.view-proposal-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            // Close project modal
            document.getElementById('view-project-modal').classList.remove('active');
            
            // Open proposal modal
            openProposalModal(this);
          });
        });
      } else {
        proposalsElement.innerHTML = '<p class="no-data">No proposals received yet.</p>';
      }
      
      // Update action buttons based on project status
      const projectActions = document.getElementById('project-actions');
      const deleteBtn = document.getElementById('delete-project-btn');
      const editBtn = document.getElementById('edit-project-btn');
      const approveBtn = document.getElementById('approve-project-btn');
      
      // Delete button
      if (deleteBtn) {
        deleteBtn.setAttribute('data-id', project._id);
        deleteBtn.addEventListener('click', handleDeleteProject);
      }
      
      // Edit button
      if (editBtn) {
        editBtn.setAttribute('data-id', project._id);
        // Implement edit functionality if needed
      }
      
      // Approve button (only show for pending projects)
      if (approveBtn) {
        if (project.status === 'Pending') {
          approveBtn.style.display = 'inline-flex';
          approveBtn.setAttribute('data-id', project._id);
          approveBtn.addEventListener('click', handleApproveProject);
        } else {
          approveBtn.style.display = 'none';
        }
      }
      
      // Show modal
      document.getElementById('view-project-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
      
    } catch (error) {
      console.error('Error opening project modal:', error);
    }
  }
  
  // Open proposal modal
  function openProposalModal(btnElement) {
    // Get data from button attributes
    const proposalId = btnElement.getAttribute('data-id');
    const projectTitle = btnElement.getAttribute('data-project-title');
    const freelancerName = btnElement.getAttribute('data-freelancer-name');
    const freelancerSkills = btnElement.getAttribute('data-freelancer-skills');
    const message = btnElement.getAttribute('data-message');
    const budget = btnElement.getAttribute('data-budget');
    const status = btnElement.getAttribute('data-status');
    
    // Update modal content
    document.getElementById('proposal-project-title').textContent = projectTitle;
    document.getElementById('proposal-freelancer-name').textContent = freelancerName;
    document.getElementById('proposal-message').textContent = message;
    document.getElementById('proposal-budget').textContent = formatCurrency(budget);
    
    // Update status badge
    const statusElement = document.getElementById('proposal-status');
    statusElement.innerHTML = `<span class="status-badge ${getStatusClass(status)}">${status}</span>`;
    
    // Update freelancer skills
    const skillsElement = document.getElementById('proposal-freelancer-skills');
    if (freelancerSkills && freelancerSkills.length > 0) {
      const skillsArray = freelancerSkills.split(',');
      skillsElement.innerHTML = skillsArray.map(skill => `<span>${skill.trim()}</span>`).join('');
    } else {
      skillsElement.innerHTML = '<p>No skills listed</p>';
    }
    
    // Update action buttons based on proposal status
    const proposalActions = document.getElementById('proposal-actions');
    const rejectBtn = document.getElementById('reject-proposal-btn');
    const acceptBtn = document.getElementById('accept-proposal-btn');
    
    if (status === 'Pending') {
      proposalActions.style.display = 'flex';
      
      // Reject button
      if (rejectBtn) {
        rejectBtn.setAttribute('data-id', proposalId);
        rejectBtn.addEventListener('click', function() {
          handleProposalStatusChange(proposalId, 'Rejected');
        });
      }
      
      // Accept button
      if (acceptBtn) {
        acceptBtn.setAttribute('data-id', proposalId);
        acceptBtn.addEventListener('click', function() {
          handleProposalStatusChange(proposalId, 'Accepted');
        });
      }
    } else {
      proposalActions.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('view-proposal-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Handle create project form submission
  async function handleCreateProject(e) {
    e.preventDefault();
    
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const budget = document.getElementById('project-budget').value;
    const deadline = document.getElementById('project-deadline').value;
    const skills = document.getElementById('project-skills').value;
    
    // Basic validation
    if (!title || !description || !budget || !deadline) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = createProjectForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
      submitBtn.disabled = true;
      
      // Prepare skills array
      const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];
      
      // Make API request
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          description,
          budget: Number(budget),
          deadline,
          skills: skillsArray
        })
      });
      
      // Reset button state
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }
      
      // Close modal and reset form
      createProjectModal.classList.remove('active');
      document.body.style.overflow = '';
      createProjectForm.reset();
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  }
  
  // Handle delete project
  async function handleDeleteProject() {
    const projectId = this.getAttribute('data-id');
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }
      
      // Close modal
      document.getElementById('view-project-modal').classList.remove('active');
      document.body.style.overflow = '';
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  }
  
  // Handle approve project
  async function handleApproveProject() {
    const projectId = this.getAttribute('data-id');
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'Approved'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve project');
      }
      
      // Close modal
      document.getElementById('view-project-modal').classList.remove('active');
      document.body.style.overflow = '';
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (error) {
      console.error('Error approving project:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  }
  
  // Handle proposal status change (accept/reject)
  async function handleProposalStatusChange(proposalId, newStatus) {
    try {
      const response = await fetch(`${API_URL}/proposals/${proposalId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${newStatus.toLowerCase()} proposal`);
      }
      
      // Close modal
      document.getElementById('view-proposal-modal').classList.remove('active');
      document.body.style.overflow = '';
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()}ing proposal:`, error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  }
});