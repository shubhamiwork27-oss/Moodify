const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, '../Frontend/public/models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
];

files.forEach(file => {
    const url = baseUrl + file;
    const dest = path.join(modelsDir, file);
    if (!fs.existsSync(dest)) {
        console.log(`Downloading ${file}...`);
        const req = https.get(url, (res) => {
            const fileStream = fs.createWriteStream(dest);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded ${file}`);
            });
        });
        req.on('error', (err) => {
            console.error(`Error downloading ${file}: ${err.message}`);
        });
    } else {
        console.log(`${file} already exists.`);
    }
});
