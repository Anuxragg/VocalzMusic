const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Song = require('../models/Song');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const songs = await Song.find({}).limit(5);
        console.log('Songs in DB:', JSON.stringify(songs, null, 2));
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Check Failed:', error);
        process.exit(1);
    }
}

check();
