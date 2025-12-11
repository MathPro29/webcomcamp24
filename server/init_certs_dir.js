
// Ensure upload directory exists
import fs from 'fs';
import { ensureStorageExists } from './config/storage.js';

ensureStorageExists(fs);
