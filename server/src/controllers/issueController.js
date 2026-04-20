const Issue = require('../models/Issue');
const Project = require('../models/Project');

// @desc    Create an issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, status, priority, projectId, assigneeId, tags } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and project are required.' });
    }

    // Verify project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const issue = await Issue.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      project: projectId,
      reporter: req.user._id,
      assignee: assigneeId || null,
      tags: tags || [],
    });

    const populated = await issue.populate([
      { path: 'reporter', select: 'name email avatar' },
      { path: 'assignee', select: 'name email avatar' },
    ]);

    res.status(201).json({ success: true, issue: populated });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get issues for a project
// @route   GET /api/issues?projectId=xxx
// @access  Private
const getIssues = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId is required.' });
    }

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const issues = await Issue.find(filter)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, issues });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Private
const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    res.status(200).json({ success: true, issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    const updated = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar');

    res.status(200).json({ success: true, issue: updated });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    if (issue.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only reporter can delete issue.' });
    }

    await issue.deleteOne();
    res.status(200).json({ success: true, message: 'Issue deleted.' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createIssue, getIssues, getIssue, updateIssue, deleteIssue };
