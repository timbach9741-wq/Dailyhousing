import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 신규 사용자 등록 등에 사용하기 위한 보조 Auth 인스턴스 (메인 세션 로그아웃 방지)
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);

export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase 연결 상태 확인
export const checkFirebaseConnection = async () => {
    try {
        await getDoc(doc(db, "_health", "check"));
        return true;
    } catch (error) {
        // 문서 미존재(not-found)나 권한 거부(permission-denied)는 연결 자체는 성공한 것
        const code = error?.code || '';
        if (code === 'permission-denied' || code === 'not-found') {
            return true;
        }
        console.error("Firebase 연결 실패:", error);
        return false;
    }
};

export default app;

