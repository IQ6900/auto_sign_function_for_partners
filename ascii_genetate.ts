// Helper function to load an image
// import sharp from 'sharp';
const sharp = require('sharp');

async function loadImage(filePath: string) {
    return sharp(filePath);
}

async function imgToAsciiArt(imageSrc: string, fontSize = 5, outputHeight = 700) {
    try {

        const image = await loadImage(imageSrc);
        const metadata = await image.metadata();

        const aspectRatio = metadata.width! / metadata.height!;
        const outputWidth = Math.floor(outputHeight * aspectRatio);
        const resizedImage = await image.resize(outputWidth, outputHeight).toBuffer();

        const { data, info } = await sharp(resizedImage).raw().toBuffer({ resolveWithObject: true });
        let result: string[] = [];
        for (let y = 0; y < info.height; y += fontSize) {
            let line = '';
            for (let x = 0; x < info.width; x += fontSize) {
                const index = (y * info.width + x) * 4;
                const [r, g, b, a] = [data[index], data[index + 1], data[index + 2], data[index + 3]];

                let char = ' ';
                if (a > 0) {
                    const brightness = (r + g + b) / 3;
                    // Map brightness to characters
                    if (brightness < 51) {
                        char = ' ';
                    } else if (brightness < 102) {
                        char = "'";
                    } else if (brightness < 140) {
                        char = ':';
                    } else if (brightness < 170) {
                        char = 'i';
                    } else if (brightness < 200) {
                        char = 'I';
                    } else if (brightness < 210) {
                        char = 'J';
                    } else {
                        char = '$';
                    }
                }
                line += char;
            }
            result.push(line);
        }
        let result_string = result.join('\n');
        return {
            result: result_string,
            width: result[0].length,
        };
    } catch (error) {
        console.error('Error loading image:', error);
        throw new Error('Image loading failed.');
    }
}
export default imgToAsciiArt
