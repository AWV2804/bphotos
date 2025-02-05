import * as exifr from 'exifr';
import * as fs from 'fs';

async function getMetadata(filePath: string) {
    try {
        const metadata = await exifr.parse(filePath);
        const metadataJson = JSON.stringify(metadata, null, 2);
        console.log(metadataJson);
        return metadataJson;
    } catch (error) {
        console.error('Error reading metadata:', error);
        throw error;
    }
}

// Example usage
const photoPath = '/home/athar/Documents/bphotos/server/tests/DownloadedTestPhotos/Yellowstone Day 1 016_downloaded.jpg';
getMetadata(photoPath);