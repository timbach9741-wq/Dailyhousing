import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log('Firebase Config loaded for project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        const docRef = doc(db, 'site_config', 'homepage');
        const docSnap = await getDoc(docRef);

        let data = {};
        if (docSnap.exists()) {
            data = docSnap.data();
            console.log('Existing homepage config loaded.');
        } else {
            console.log('No existing homepage config found, creating new.');
        }

        // Merge business info
        const existingBusiness = data.business || {};
        const updatedBusiness = {
            ...existingBusiness,
            companyName: '데일리하우징',
            bizNumber: '361-28-01723',
            bankAccount: '국민은행 350601-04-419058 (예금주: 데일리하우징)'
        };

        // Merge contact info
        const existingContact = data.contact || {};
        const updatedContact = {
            ...existingContact,
            address: '경기도 안산시 상록구 장화3길 35'
        };

        const updatedData = {
            ...data,
            business: updatedBusiness,
            contact: updatedContact
        };

        await setDoc(docRef, updatedData);
        console.log('✅ Firestore site_config/homepage successfully updated!');
        console.log('Updated Business:', updatedBusiness);
        console.log('Updated Contact:', updatedContact);
    } catch (error) {
        console.error('❌ Failed to update Firestore site_config/homepage:', error);
    }
    process.exit(0);
}

run();
