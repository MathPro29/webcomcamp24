import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage paths
// __dirname is server/config
// We want to store in root/storage/certificates (sibling of server)
export const CERTIFICATE_UPLOAD_PATH = path.join(__dirname, '../../storage/certificates');

export const ensureStorageExists = (fs) => {
    if (!fs.existsSync(CERTIFICATE_UPLOAD_PATH)) {
        fs.mkdirSync(CERTIFICATE_UPLOAD_PATH, { recursive: true });
        console.log(`✅ Created certificate storage directory: ${CERTIFICATE_UPLOAD_PATH}`);
    }
};
