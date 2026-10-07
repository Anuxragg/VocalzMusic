const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
const Song = require('../models/Song');
const User = require('../models/User');

// --- Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MEDIA_DIR = path.resolve(__dirname, '../../src/media');

// --- Your 8 Local Songs Metadata ---
const songsToMigrate = [
    {
        songName: 'Lucid Dreams',
        artist: 'Juice WRLD',
        audioFile: 'lucid-dreams-juice-wrld.mp3',
        songImage: 'lucid-dreams.jpg',
        duration: 230, // in seconds (approx 03:50)
        genre: 'Hip-Hop'
    },
    {
        songName: 'Blinding Lights',
        artist: 'The Weekend',
        audioFile: 'blinding-lights-weekend.mp3',
        songImage: 'blinding-lights.jpg',
        duration: 203, // (03:23)
        genre: 'Pop'
    },
    {
        songName: 'The Real Slim Shady',
        artist: 'Eminem',
        audioFile: 'real-slim-shady-eminem.mp3',
        songImage: 'the-real-slim-shady.jpg',
        duration: 284, // (04:44)
        genre: 'Hip-Hop'
    },
    {
        songName: 'Malabari Banger',
        artist: 'M.H.R, JOKER390P, SA, Dabzee',
        audioFile: 'malabari-banger-mhr.mp3',
        songImage: 'malabari-banger.jpg',
        duration: 246, // (04:06)
        genre: 'Malyalam'
    },
    {
        songName: 'Memory Reboot',
        artist: 'VOJ',
        audioFile: 'memory-reboot-voj.mp3',
        songImage: 'memory-reboot.jpg',
        duration: 208, // (03:28)
        genre: 'Phonk'
    },
    {
        songName: 'Runaway',
        artist: 'Kanye West',
        audioFile: 'runaway-kanye-west.mp3',
        songImage: 'runaway.jpg',
        duration: 547, // (09:07)
        genre: 'Classic'
    },
    {
        songName: 'Starboy',
        artist: 'The Weekend',
        audioFile: 'starboy-weekend.mp3',
        songImage: 'starboy.jpg',
        duration: 231, // (03:51)
        genre: 'Pop'
    },
    {
        songName: 'The Search',
        artist: 'NF',
        audioFile: 'the-search-nf.mp3',
        songImage: 'the-search.jpg',
        duration: 291, // (04:51)
        genre: 'Rap'
    }
];

async function migrate() {
    try {
        console.log('--- Starting CloudSync Migration ---');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Find or create an uploader (use the first user found or a system user)
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) admin = await User.findOne({});
        if (!admin) {
           console.error('No user found to assign songs to. Please register a user first!');
           process.exit(1);
        }
        console.log(`Using User: ${admin.username} (${admin._id}) as uploader.`);

        // 0. Clean old versions to avoid duplicates
        const songTitles = songsToMigrate.map(s => s.songName);
        console.log(`\nCleaning old entries for: ${songTitles.join(', ')}...`);
        await Song.deleteMany({ title: { $in: songTitles } });
        console.log('✓ Cleanup complete.');

        for (const item of songsToMigrate) {
            console.log(`\nUploading: ${item.songName} by ${item.artist}...`);

            const audioPath = path.join(MEDIA_DIR, item.audioFile);
            const imagePath = path.join(MEDIA_DIR, item.songImage);

            if (!fs.existsSync(audioPath) || !fs.existsSync(imagePath)) {
                console.error(`Files missing for ${item.songName}. Skipping...`);
                continue;
            }

            // 1. Upload Cover Image
            const coverResult = await cloudinary.uploader.upload(imagePath, {
                folder: 'vocalz/covers',
                crop: 'fill',
                width: 500,
                height: 500
            });
            console.log(`✓ Image Uploaded: ${coverResult.secure_url}`);

            // 2. Upload Audio File
            const audioResult = await cloudinary.uploader.upload(audioPath, {
                folder: 'vocalz/audio',
                resource_type: 'video'
            });
            console.log(`✓ Audio Uploaded: ${audioResult.secure_url}`);

            // 3. Save Song to MongoDB
            await Song.create({
                title: item.songName,
                artist: item.artist,
                audioUrl: audioResult.secure_url,
                audioPublicId: audioResult.public_id,
                coverUrl: coverResult.secure_url,
                coverPublicId: coverResult.public_id,
                duration: item.duration,
                genre: item.genre,
                uploadedBy: admin._id,
                isPublic: true
            });
            console.log(`✓ Saved to MongoDB.`);
        }

        console.log('\n--- Migration Complete Successfully ---');
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
