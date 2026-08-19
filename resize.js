const { Jimp } = require('jimp');

async function resize() {
    try {
        const image = await Jimp.read('logo - offstump.png');
        await image.resize({ w: 96, h: 96 });
        await image.write('favicon-new.png');
        console.log('Favicon resized successfully.');
    } catch (err) {
        console.error('Error resizing image:', err);
    }
}

resize();
