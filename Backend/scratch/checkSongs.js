require('dotenv').config();
const mongoose = require('mongoose');
const songModel = require('../src/models/song.model');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function checkSongs() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await songModel.countDocuments();
    console.log(`Total songs in DB: ${count}`);
    const songs = await songModel.find().limit(5);
    console.log('Sample songs:', songs);
    process.exit(0);
}

checkSongs();
