const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireHead } = require('../middleware/role.middleware');
const { listPending, approveUser, rejectUser } = require('../controllers/users.controller');

const router = express.Router();

// Semua endpoint di sini butuh login DAN role Head
router.use(requireAuth, requireHead);

router.get('/pending', listPending);
router.post('/:id/approve', approveUser);
router.post('/:id/reject', rejectUser);

module.exports = router;
