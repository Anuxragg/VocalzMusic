const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const artistController = require('../controllers/artistController');

const router = express.Router();

router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtist);
router.get('/:id/songs', artistController.getArtistSongs);
router.get('/:id/albums', artistController.getArtistAlbums);
router.patch('/:id', protect, adminOnly, artistController.artistUploadMiddleware, artistController.updateArtist);
router.patch('/name/:displayName', protect, adminOnly, artistController.artistUploadMiddleware, artistController.updateArtistByDisplayName);
router.post('/:id/follow', protect, artistController.followArtist);
router.delete('/:id/follow', protect, artistController.unfollowArtist);

module.exports = router;
