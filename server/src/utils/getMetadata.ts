import * as exifr from 'exifr';
import * as fs from 'fs';
import { logInfo } from './logger';

export async function getMetadata(filePath: string) {
    try {
        const metadata = await exifr.parse(filePath, true);
        const metadataStringified = JSON.stringify(metadata, null, 2);
        logInfo(metadata);
        return [true, metadata, metadataStringified];
    } catch (error) {
        logInfo('Error reading metadata:', error);
        return [false, error, null];
    }
}

// Example usage
// const photoPath = '/home/athar/Documents/bphotos/SamplePhotos/Sofa Location.HEIC';
// getMetadata(photoPath);
// (async () => {
//     const [success, metadata, metadataStringified] = await getMetadata(photoPath);
//     logInfo(metadata)
// })();