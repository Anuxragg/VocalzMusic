const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

const Song = require('../server/models/Song');
const Artist = require('../server/models/Artist');

async function fix() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Set MONGO_URI or MONGODB_URI in the environment or server/.env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    // Update any song with artist 'Daniel Caesar' to 'Daniel Ceasar'
    const result = await Song.updateMany(
      { artist: 'Daniel Caesar' },
      { $set: { artist: 'Daniel Ceasar' } }
    );
    console.log(`Updated ${result.modifiedCount} songs.`);

    // Delete the incorrect artist profile
    const delResult = await Artist.deleteOne({ displayName: 'Daniel Caesar' });
    console.log(`Deleted ${delResult.deletedCount} incorrect artist profiles.`);

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
