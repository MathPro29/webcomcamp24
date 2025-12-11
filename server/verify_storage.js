import { CERTIFICATE_UPLOAD_PATH, ensureStorageExists } from './config/storage.js';
import fs from 'fs';
import path from 'path';

console.log('Testing Storage Configuration...');
console.log(`CERTIFICATE_UPLOAD_PATH: ${CERTIFICATE_UPLOAD_PATH}`);

try {
    ensureStorageExists(fs);
    if (fs.existsSync(CERTIFICATE_UPLOAD_PATH)) {
        console.log('✅ Storage directory exists (or was created).');

        // Try writing a test file
        const testFile = path.join(CERTIFICATE_UPLOAD_PATH, 'test_write.txt');
        fs.writeFileSync(testFile, 'Test content');
        console.log(`✅ Successfully wrote to ${testFile}`);

        // Clean up
        fs.unlinkSync(testFile);
        console.log('✅ Successfully cleaned up test file.');

    } else {
        console.error('❌ Storage directory does not exist after ensureStorageExists call.');
    }
} catch (error) {
    console.error('❌ Error during verification:', error);
}
