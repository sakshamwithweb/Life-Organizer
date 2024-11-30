import crypto from 'crypto';

// Use the fixed 32-byte key (already provided)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '093f61f9d4c403fb46555516c94680990d7e1ad355a0fe9721a26cf4f6dad8c7';
const IV_LENGTH = 16; // AES block size is 16 bytes

export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH); // Random IV for each encryption
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return the IV and encrypted data as a string, separated by ":"
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText) {
    const [ivHex, encryptedData] = encryptedText.split(':'); // Split the IV and encrypted data
    const iv = Buffer.from(ivHex, 'hex'); // Convert IV from hex to Buffer

    // Create the decipher with the same key and IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString(); // Return the decrypted text as a string
}