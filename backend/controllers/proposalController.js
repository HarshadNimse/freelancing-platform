import Proposal from '../models/Proposal.js';
import Project from '../models/Project.js';

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private/Freelancer
export const createProposal = async (req, res) => {
  try {
    const { projectId, message, expectedBudget } = req.body;

    // Check if project exists and is approved
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'Approved') {
      return res.status(400).json({ message: 'Cannot submit proposal to a project that is not approved' });
    }

    // Check if freelancer already submitted a proposal for this project
    const existingProposal = await Proposal.findOne({
      project: projectId,
      freelancer: req.user._id,
    });

    if (existingProposal) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this project' });
    }

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      message,
      expectedBudget,
    });

    res.status(201).json(proposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all proposals for a project
// @route   GET /api/proposals/project/:projectId
// @access  Private/Client
export const getProjectProposals = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view proposals for this project' });
    }

    const proposals = await Proposal.find({ project: req.params.projectId })
      .populate('freelancer', 'name email skills bio');

    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all proposals by freelancer
// @route   GET /api/proposals/freelancer
// @access  Private/Freelancer
export const getFreelancerProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('project', 'title description budget deadline status');

    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update proposal status
// @route   PUT /api/proposals/:id/status
// @access  Private/Client
export const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const proposal = await Proposal.findById(req.params.id)
      .populate('project');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if user is the client who owns the project
    if (proposal.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this proposal' });
    }

    // If accepting proposal, reject all other proposals for this project
    if (status === 'Accepted') {
      await Proposal.updateMany(
        { 
          project: proposal.project._id, 
          _id: { $ne: proposal._id },
          status: 'Pending'
        },
        { status: 'Rejected' }
      );
    }

    proposal.status = status;
    await proposal.save();

    res.json(proposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};