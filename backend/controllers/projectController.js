import Project from '../models/Project.js';
import Proposal from '../models/Proposal.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Client
export const createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      skills,
      client: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let projects;
    
    if (req.user.role === 'client') {
      // If client, get all projects created by the client
      projects = await Project.find({ client: req.user._id });
    } else {
      // If freelancer, get all approved projects
      projects = await Project.find({ status: 'Approved' });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is client who created the project or if project is approved
    if (
      req.user.role === 'freelancer' && 
      project.status !== 'Approved'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Client
export const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Client
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete project and associated proposals
    await Proposal.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private/Client
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    project.status = status;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};