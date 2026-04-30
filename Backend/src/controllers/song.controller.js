const songModel = require("../models/song.model")
const storageService = require("../services/storage.service")
const id3 = require("node-id3")


async function uploadSong(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No song file uploaded" });
        }

        const songBuffer = req.file.buffer;
        const { mood } = req.body;

        const tags = id3.read(songBuffer);
        const title = tags.title || "Untitled Song";

        const uploadPromises = [
            storageService.uploadFile({
                buffer: songBuffer,
                filename: title + ".mp3",
                folder: "/cohort-2/moodify/songs"
            })
        ];

        if (tags.image && tags.image.imageBuffer) {
            uploadPromises.push(
                storageService.uploadFile({
                    buffer: tags.image.imageBuffer,
                    filename: title + ".jpeg",
                    folder: "/cohort-2/moodify/posters"
                })
            );
        }

        const uploadResults = await Promise.all(uploadPromises);
        const songFile = uploadResults[0];
        const posterFile = uploadResults[1] || { url: "https://via.placeholder.com/150" };

        const song = await songModel.create({
            title: title,
            url: songFile.url,
            posterUrl: posterFile.url,
            mood
        });

        res.status(201).json({
            message: "song created successfully",
            song
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getSong(req, res) {

    const { mood } = req.query

    const song = await songModel.findOne({
        mood,
    })

    res.status(200).json({
        message: "song fetched successfully.",
        song,
    })

}


module.exports = { uploadSong, getSong }