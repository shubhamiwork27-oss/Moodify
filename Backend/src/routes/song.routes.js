const express = require("express")
const upload = require("../middlewares/upload.middleware")
const songController = require("../controllers/song.controller")
const fs = require("fs")
const path = require("path")

const router = express.Router()

/**
 * POST /api/songs/
 */
router.post("/", upload.single("song"), songController.uploadSong)

router.get('/', songController.getSong)

router.get('/local', (req, res) => {
    const songsDir = path.join(__dirname, '../../../songs');
    if (!fs.existsSync(songsDir)) return res.json({ songs: [] });
    const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.mp3'));
    res.json({ songs: files });
});

router.get('/stream/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../../../songs', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
    res.sendFile(filePath);
});
module.exports = router