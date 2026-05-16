const Artist = require('../models/Artist');
const Song = require('../models/Song');
const Album = require('../models/Album');
const User = require('../models/User');

exports.getArtists = async (req, res, next) => {
  try {
    const artists = await Artist.find().populate('user', 'username avatar');
    res.status(200).json({ success: true, data: artists });
  } catch (error) {
    next(error);
  }
};

exports.getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user', 'username avatar');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    next(error);
  }
};

exports.getArtistSongs = async (req, res, next) => {
  try {
    const songs = await Song.find({ artistRef: req.params.id, isPublic: true });
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    next(error);
  }
};

exports.getArtistAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find({ artistRef: req.params.id, isPublic: true });
    res.status(200).json({ success: true, data: albums });
  } catch (error) {
    next(error);
  }
};

exports.artistUploadMiddleware = (req, res, next) => {
  try {
    const multer = require('multer');
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }).fields([{ name: 'avatar', maxCount: 1 }]);

    return upload(req, res, next);
  } catch (error) {
    return next(error);
  }
};

const uploadBufferToCloudinary = (buffer, folder) => new Promise((resolve, reject) => {
  const { cloudinary } = require('../config/cloudinary');
  const timeoutId = setTimeout(() => {
    reject(new Error('Cloudinary upload timed out after 60 seconds'));
  }, 60000);

  const stream = cloudinary.uploader.upload_stream(
    { folder, resource_type: 'image' },
    (error, result) => {
      clearTimeout(timeoutId);
      if (error) return reject(error);
      return resolve(result);
    }
  );
  stream.end(buffer);
});

exports.updateArtist = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    if (req.files && req.files.avatar) {
      const result = await uploadBufferToCloudinary(req.files.avatar[0].buffer, 'vocalz/artist_avatars');
      updateData.avatar = result.secure_url;
    }

    const artist = await Artist.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    next(error);
  }
};

exports.followArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });

    const user = await User.findById(req.user._id);
    if (!user.following.some((id) => id.toString() === artist.user.toString())) {
      user.following.push(artist.user);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Artist followed' });
  } catch (error) {
    next(error);
  }
};

exports.unfollowArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: artist.user },
    });

    res.status(200).json({ success: true, message: 'Artist unfollowed' });
  } catch (error) {
    next(error);
  }
};

exports.updateArtistByDisplayName = async (req, res, next) => {
  try {
    const { displayName } = req.params;
    let updateData = { ...req.body };

    if (req.files && req.files.avatar) {
      const result = await uploadBufferToCloudinary(req.files.avatar[0].buffer, 'vocalz/artist_avatars');
      updateData.avatar = result.secure_url;
    }

    // Upsert: Find by name or create
    let artist = await Artist.findOneAndUpdate(
      { displayName },
      { 
        $set: updateData,
        $setOnInsert: { 
          bio: `Artist profile for ${displayName}`
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If it was newly inserted and no avatar was provided in updateData, set default avatar
    if (!updateData.avatar && artist.avatar === '') {
      artist.avatar = '/media/default_artist.png';
      await artist.save();
    }

    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    console.error('Error in updateArtistByDisplayName:', error);
    next(error);
  }
};
