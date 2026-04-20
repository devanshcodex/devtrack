const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getIssues).post(createIssue);
router.route('/:id').get(getIssue).put(updateIssue).delete(deleteIssue);

module.exports = router;
