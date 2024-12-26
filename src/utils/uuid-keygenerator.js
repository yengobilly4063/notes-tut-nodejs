import * as crypto from 'node:crypto';

export function generateKey() {
    return crypto.randomBytes(20).toString('hex');
}
