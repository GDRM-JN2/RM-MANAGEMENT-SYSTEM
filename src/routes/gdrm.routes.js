const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireModule } = require('../middleware/role.middleware');

const reservasi = require('../controllers/gdrm/reservasi.controller');
const planning = require('../controllers/gdrm/planning.controller');
const serviceLevel = require('../controllers/gdrm/serviceLevel.controller');

const router = express.Router();

// Semua endpoint di bawah ini butuh login DAN akses ke modul GDRM
router.use(requireAuth, requireModule('GDRM'));

// Reservasi
router.post('/reservasi', reservasi.create);
router.get('/reservasi', reservasi.list);
router.get('/reservasi/:id', reservasi.getById);
router.patch('/reservasi/:id/status', reservasi.updateStatus);
router.delete('/reservasi/:id', reservasi.softDelete);

// Planning (dibuat otomatis lewat trigger saat Reservasi approved)
router.get('/planning', planning.list);
router.get('/planning/:id', planning.getById);
router.patch('/planning/:id', planning.update);

// Service Level (dibuat otomatis lewat trigger saat Reservasi approved)
router.get('/service-level', serviceLevel.list);
router.get('/service-level/:id', serviceLevel.getById);
router.patch('/service-level/:id', serviceLevel.update);

module.exports = router;
