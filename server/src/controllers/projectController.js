const Project = require('../models/Project');
const Issue = require('../models/Issue');

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach issue counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const issueCount = await Issue.countDocuments({ project: project._id });
        const openIssues = await Issue.countDocuments({
          project: project._id,
          status: { $in: ['todo', 'in-progress'] },
        });
        return { ...project.toObject(), issueCount, openIssues };
      })
    );

    res.status(200).json({ success: true, projects: projectsWithCounts });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner members',
      'name email avatar'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check access
    const hasAccess =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only owner can update project.' });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only owner can delete project.' });
    }

    // Delete all issues in this project
    await Issue.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
