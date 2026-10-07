const mongoose = require('mongoose');
const Song = require('../models/Song');
const Album = require('../models/Album');
const { cloudinary } = require('../config/cloudinary');
const { parseSongListOptions } = require('../utils/songQuery');

// Signature generation for direct frontend uploads
exports.generateSignature = (req, res, next) => {
  try {
    const category = req.query.folder;
    if (!['audio', 'covers'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid upload category' });
    }

    const folder = `vocalz/${category}/${req.user._id}`;
    const timestamp = Math.round((new Date).getTime()/1000);
    
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: folder
    }, process.env.CLOUDINARY_API_SECRET);

    return res.status(200).json({ 
      success: true, 
      timestamp, 
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    return next(error);
  }
};

const getOwnedCloudinaryAsset = async (publicId, category, resourceType, userId) => {
  const folder = `vocalz/${category}/${userId}`;
  if (typeof publicId !== 'string' || !publicId.startsWith(`${folder}/`)) return null;

  let asset;
  try {
    asset = await cloudinary.api.resource(publicId, { resource_type: resourceType });
  } catch (error) {
    if (error.http_code === 404) return null;
    throw error;
  }
  if (asset.public_id !== publicId || !asset.secure_url) return null;

  return { publicId: asset.public_id, url: asset.secure_url, duration: asset.duration };
};

exports.getSongs = async (req, res, next) => {
  try {
    const options = parseSongListOptions(req.query);
    if (!options) {
      return res.status(400).json({ success: false, message: 'Invalid song query parameters' });
    }
    const { filter, pageNumber, pageLimit, sort } = options;

    const total = await Song.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageLimit));
    if (pageNumber > totalPages) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { total, page: pageNumber, limit: pageLimit },
      });
    }

    const songs = await Song.find(filter)
      .populate('album', 'title coverUrl')
      .populate('artistRef', 'displayName')
      .sort(sort)
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      data: songs,
      pagination: { total, page: pageNumber, limit: pageLimit },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id).populate('album artistRef', 'title displayName');
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });

    const isOwner = req.user && song.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === 'admin';
    if (!song.isPublic && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    return res.status(200).json({ success: true, data: song });
  } catch (error) {
    return next(error);
  }
};

exports.createSong = async (req, res, next) => {
  try {
    // We now expect the frontend to have uploaded the files to Cloudinary directly
    // and pass us the resulting URLs.
    const { title, artist, artistRef, album, albumText, duration, genre, isPublic = true, audioPublicId, coverUrl, coverPublicId } = req.body;
    
    const audioAsset = await getOwnedCloudinaryAsset(audioPublicId, 'audio', 'video', req.user._id);
    if (!audioAsset) {
      return res.status(400).json({ success: false, message: 'Audio must be uploaded to your account before publishing.' });
    }

    let finalCoverUrl = coverUrl || '';
    let finalCoverPublicId = coverPublicId || '';

    if (finalCoverUrl || finalCoverPublicId) {
      if (!finalCoverUrl || !finalCoverPublicId) {
        return res.status(400).json({ success: false, message: 'Cover URL and public ID must be provided together.' });
      }

      const ownedCover = await getOwnedCloudinaryAsset(finalCoverPublicId, 'covers', 'image', req.user._id);
      if (ownedCover) {
        finalCoverUrl = ownedCover.url;
        finalCoverPublicId = ownedCover.publicId;
      } else {
        const existingCover = await Promise.all([
          Song.exists({ coverUrl: finalCoverUrl, coverPublicId: finalCoverPublicId }),
          Album.exists({ coverUrl: finalCoverUrl, coverPublicId: finalCoverPublicId }),
        ]);
        if (!existingCover.some(Boolean)) {
          return res.status(400).json({ success: false, message: 'Cover must be uploaded to your account or selected from an existing library item.' });
        }
      }
    }

    let targetAlbumId = (album && mongoose.Types.ObjectId.isValid(album)) ? album : undefined;

    // Inherit cover from album if no song cover or URL provided
    if (!finalCoverUrl && (album || albumText)) {
      let parentAlbum;
      if (targetAlbumId) {
        parentAlbum = await Album.findById(targetAlbumId);
      } else if (albumText) {
        parentAlbum = await Album.findOne({ title: new RegExp(`^${albumText}$`, 'i') });
      }

      if (parentAlbum && parentAlbum.coverUrl) {
        finalCoverUrl = parentAlbum.coverUrl;
        finalCoverPublicId = parentAlbum.coverPublicId;
        if (!targetAlbumId) targetAlbumId = parentAlbum._id;
        console.log('📦 Inheriting cover from album:', parentAlbum.title);
      }
    }

    const song = await Song.create({
      title: title || 'Untitled Track',
      artist: artist || req.user.username,
      artistRef: artistRef || undefined,
      album: targetAlbumId,
      albumText: albumText || '',
      audioUrl: audioAsset.url,
      audioPublicId: audioAsset.publicId,
      coverUrl: finalCoverUrl,
      coverPublicId: finalCoverPublicId,
      duration: Number(duration || 0),
      genre: genre || 'Pop',
      uploadedBy: req.user._id,
      isPublic: String(isPublic) !== 'false',
    });

    return res.status(201).json({ success: true, data: song });
  } catch (error) {
    return next(error);
  }
};

exports.updateSong = async (req, res, next) => {
  try {
    const { title, artist, genre, albumText, isPublic, coverUrl, coverPublicId, album } = req.body;
    const song = await Song.findById(req.params.id);

    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });

    // Permissions check
    if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this track' });
    }

    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (genre) song.genre = genre;
    if (albumText !== undefined) song.albumText = albumText;
    if (isPublic !== undefined) song.isPublic = (isPublic === true || isPublic === 'true');

    // Handle Cover Update (verified Cloudinary assets or existing library items)
    if (coverUrl !== undefined || coverPublicId !== undefined) {
      if (!coverUrl || !coverPublicId) {
        return res.status(400).json({ success: false, message: 'Cover URL and public ID must be provided together.' });
      }

      const ownedCover = await getOwnedCloudinaryAsset(coverPublicId, 'covers', 'image', req.user._id);
      if (ownedCover) {
        song.coverUrl = ownedCover.url;
        song.coverPublicId = ownedCover.publicId;
      } else {
        const existingCover = await Promise.all([
          Song.exists({ coverUrl, coverPublicId }),
          Album.exists({ coverUrl, coverPublicId }),
        ]);
        if (!existingCover.some(Boolean)) {
          return res.status(400).json({ success: false, message: 'Cover must be uploaded to your account or selected from an existing library item.' });
        }
        song.coverUrl = coverUrl;
        song.coverPublicId = coverPublicId;
      }
    } else if (album && mongoose.Types.ObjectId.isValid(album)) {
      // If album changed and no new cover provided, update cover from new album
      const newAlbum = await Album.findById(album);
      if (newAlbum && newAlbum.coverUrl) {
        song.coverUrl = newAlbum.coverUrl;
        song.coverPublicId = newAlbum.coverPublicId;
        song.album = newAlbum._id;
      }
    }

    await song.save();
    return res.status(200).json({ success: true, data: song });
  } catch (error) {
    return next(error);
  }
};

exports.deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });

    const ownedAudioPrefix = `vocalz/audio/${song.uploadedBy}/`;
    if (song.audioPublicId?.startsWith(ownedAudioPrefix)) {
      await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' });
    }
    const ownedCoverPrefix = `vocalz/covers/${song.uploadedBy}/`;
    if (song.coverPublicId?.startsWith(ownedCoverPrefix)) {
      // Check if any other song or album uses this cover image before deleting from Cloudinary
      const [otherSong, albumWithCover] = await Promise.all([
        Song.findOne({ coverPublicId: song.coverPublicId, _id: { $ne: song._id } }),
        Album.findOne({ coverPublicId: song.coverPublicId })
      ]);

      if (!otherSong && !albumWithCover) {
        await cloudinary.uploader.destroy(song.coverPublicId, { resource_type: 'image' });
        console.log('🗑️ Cloudinary cover deleted.');
      } else {
        console.log('ℹ️ Skipping Cloudinary cover deletion - image is shared.');
      }
    }

    await song.deleteOne();
    return res.status(200).json({ success: true, message: 'Song deleted' });
  } catch (error) {
    return next(error);
  }
};

exports.getTrending = async (req, res, next) => {
  try {
    const songs = await Song.find({ isPublic: true }).sort({ playCount: -1 }).limit(10);
    return res.status(200).json({ success: true, data: songs });
  } catch (error) {
    return next(error);
  }
};

exports.renameAlbum = async (req, res, next) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) {
      return res.status(400).json({ success: false, message: 'Old and new names are required' });
    }

    await Song.updateMany(
      { albumText: oldName },
      { $set: { albumText: newName } }
    );

    return res.status(200).json({ success: true, message: 'Album renamed successfully' });
  } catch (error) {
    return next(error);
  }
};
