import fs from 'fs';

const inputPath = process.argv[2] || 'data/firestore-seed.json';
if (!fs.existsSync(inputPath)) {
  throw new Error(`Seed file not found: ${inputPath}`);
}

const payload = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
console.log('Validated seed file for collections:', Object.keys(payload));
console.log('Use Firebase Console > Firestore > Import JSON extension or Firebase Admin script in your backend runtime.');
console.log('This repo now supports server payment APIs; Firestore import should be executed from a trusted backend environment.');
