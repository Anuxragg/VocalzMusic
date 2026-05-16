const Album = require('../models/Album');

exports.createAlbum = async (req, res, next) => {
  try {
    let albumData = { ...req.body, owner: req.user._id };

    if (req.body.coverUrl) {
      albumData.coverUrl = req.body.coverUrl;
      albumData.coverPublicId = req.body.coverPublicId;
    }

    // Check if album with same title already exists for this owner
    let album = await Album.findOne({
        title: new RegExp(`^${req.body.title}$`, 'i'),
        owner: req.user._id
    });

    if (album) {
        // Update cover if new one provided
        if (req.body.coverUrl && !album.coverUrl) {
            album.coverUrl = req.body.coverUrl;
            album.coverPublicId = req.body.coverPublicId;
            await album.save();
        }
        return res.status(200).json({ success: true, data: album, message: 'Existing album used' });
    }

    album = await Album.create(albumData);
    res.status(201).json({ success: true, data: album });
  } catch (error) {
    next(error);
  }
};

exports.getMyAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find({ owner: req.user._id });
    res.status(200).json({ success: true, data: albums });
  } catch (error) {
    next(error);
  }
};

exports.getAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    res.status(200).json({ success: true, data: album });
  } catch (error) {
    next(error);
  }
};

exports.updateAlbum = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    if (req.body.coverUrl) {
      updateData.coverUrl = req.body.coverUrl;
      updateData.coverPublicId = req.body.coverPublicId;
    }

    const album = await Album.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    res.status(200).json({ success: true, data: album });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlbum = async (req, res, next) => {
  try {
    const { cloudinary } = require('../config/cloudinary');
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.user._id };
    const album = await Album.findOne(query);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found or unauthorized' });

    if (album.coverPublicId) {
      // Check if any other album or song uses this cover image
      const Song = require('../models/Song');
      const [otherAlbum, songWithCover] = await Promise.all([
        Album.findOne({ coverPublicId: album.coverPublicId, _id: { $ne: album._id } }),
        Song.findOne({ coverPublicId: album.coverPublicId })
      ]);

      if (!otherAlbum && !songWithCover) {
        await cloudinary.uploader.destroy(album.coverPublicId, { resource_type: 'image' });
      }
    }

    await album.deleteOne();
    res.status(200).json({ success: true, message: 'Album deleted' });
  } catch (error) {
    next(error);
  }
};
