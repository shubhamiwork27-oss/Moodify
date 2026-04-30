const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadFile({ buffer, filename, folder = "" }) {
    const file = await client.upload({
        file: buffer, // 👈 direct buffer use karo
        fileName: filename,
        folder
    });

    return file;
}

module.exports = { uploadFile };