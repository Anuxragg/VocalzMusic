const express = require('express');
const { protect, artistOnly } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const songController = require('../controllers/songController');

const router = express.Router();

router.get('/', songController.getSongs);
router.get('/trending', songController.getTrending);
router.get('/upload-signature', protect, artistOnly, songController.generateSignature);
router.get('/:id', songController.getSong);

// Direct JSON upload endpoints (no multer middleware)
router.post('/', protect, artistOnly, uploadLimiter, songController.createSong);

router.put('/rename-album/bulk', protect, artistOnly, songController.renameAlbum);
router.patch('/:id', protect, artistOnly, songController.updateSong);
router.put('/:id', protect, artistOnly, songController.updateSong);

router.delete('/:id', protect, artistOnly, songController.deleteSong);

module.exports = router;
