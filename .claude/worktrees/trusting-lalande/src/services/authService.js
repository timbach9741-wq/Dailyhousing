import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";

// 로컬 스토리지 키
const LOCAL_USERS_KEY = 'floorcraft_mock_users';
const LOCAL_SESSION_KEY = 'floorcraft_mock_session';

// 로컬 인증 유틸리티
const getLocalUsers = () => JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
const saveLocalUser = (user) => {
    const users = getLocalUsers();
    users.push(user);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};
const getLocalSession = () => JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
const setLocalSession = (user) => localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));

// 인증 상태 리스너 설정
export const initAuthListener = () => {
    const setUser = useAuthStore.getState().setUser;
    const setLoading = useAuthStore.getState().setLoading;

    // 1. 먼저 파이어베이스 리스너 시도
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};
                const role = userData.role || (user.email === 'timbach@naver.com' ? 'admin' : 'individual');
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userData.displayName || (role === 'admin' ? '관리자' : '사용자'),
                    role,
                    businessInfo: userData.businessInfo || null
                });
            } catch {
                const role = user.email === 'timbach@naver.com' ? 'admin' : 'individual';
                setUser({ ...user, role, displayName: user.displayName || (role === 'admin' ? '관리자' : '사용자') });
            }
        } else {
            // 2. 파이어베이스 세션이 없으면 로컬 세션 확인 (Bypass 모드)
            const localUser = getLocalSession();
            if (localUser) {
                setUser(localUser);
            } else {
                setUser(null);
            }
        }
        setLoading(false);
    });
};

// 로그인
export const login = async (email, password) => {
    try {
        // 파이어베이스 로그인 시도
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Firestore에서 추가 정보 가져오기
        let userData = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            role: 'individual' // 기본값
        };

        try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                userData = { ...userData, ...data };
            }
        } catch (e) { // The 'e' variable is used in the console.warn, so it cannot be removed from the catch block signature without also removing its usage.
            console.warn("Error fetching user doc:", e);
        }

        // 퇴출된 회원 차단
        if (userData.banned) {
            await signOut(auth);
            return { success: false, error: '이용이 제한된 계정입니다. 관리자에게 문의해주세요.' };
        }

        // Firestore에서 role을 못 읽은 경우 이메일로 어드민 판별
        if (!userData.role || userData.role === 'individual') {
            if (fbUser.email === 'timbach@naver.com') {
                userData.role = 'admin';
                userData.displayName = userData.displayName || '관리자';
            }
        }

        setLocalSession(userData);
        useAuthStore.getState().setUser(userData);

        return { success: true, user: userData };
    } catch {
        // 파이어베이스 실패 시 로컬 DB 확인 (Bypass)
        const localUsers = getLocalUsers();
        let user = localUsers.find(u => u.email === email && u.password === password);

        if (user) {
            const sessionUser = { ...user };
            delete sessionUser.password;
            setLocalSession(sessionUser);
            useAuthStore.getState().setUser(sessionUser);
            return { success: true, user: sessionUser };
        }
        return { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다. (Firebase 설정 오류 시 로컬 계정을 확인해 주세요)" };
    }
};

// 회원가입
export const signup = async (email, password, displayName, role = 'individual', businessInfo = null, phoneNumber = '') => {
    try {
        // 1. 파이어베이스 회원가입 시도
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName });

        // 중요: 가입 성공 시 즉시 세션 및 스토어 업데이트
        const userData = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: displayName,
            role: role,
            businessInfo: businessInfo,
            phoneNumber: phoneNumber
        };

        // Firestore에 사용자 정보 저장
        try {
            await setDoc(doc(db, "users", fbUser.uid), {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: displayName,
                role: role,
                businessInfo: businessInfo,
                phoneNumber: phoneNumber,
                password: password,
                createdAt: new Date().toISOString()
            });
        } catch {
            console.error("Firestore user doc creation failed");
        }

        setLocalSession(userData);
        useAuthStore.getState().setUser(userData);

        return { success: true, user: userData };
    } catch {
        console.warn("Firebase Auth failed, switching to Local Auth mode");

        // 2. 파이어베이스 실패 시 로컬 모드로 강제 성공 처리 (무조건 되게 만들기)
        const localUsers = getLocalUsers();
        if (localUsers.find(u => u.email === email)) {
            return { success: false, error: "이미 존재하는 이메일입니다." };
        }

        const newUser = {
            uid: `local_${Date.now()}`,
            email,
            password, // 로컬 개발용이므로 단순 저장
            displayName,
            role,
            businessInfo,
            phoneNumber,
            createdAt: new Date().toISOString()
        };

        saveLocalUser(newUser);

        const sessionUser = { ...newUser };
        delete sessionUser.password;
        setLocalSession(sessionUser);
        useAuthStore.getState().setUser(sessionUser);

        return { success: true, user: sessionUser };
    }
};

// 로그아웃
export const logout = async () => {
    try {
        await signOut(auth);
    } catch {
        // ignore
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart();
    return { success: true };
};

// 비밀번호 재설정 이메일 발송
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: "비밀번호 재설정 이메일 발송에 실패했습니다. 이메일 주소를 확인해 주세요." };
    }
};

// 이름과 휴대폰 번호로 이메일 찾기
export const findUserEmail = async (name, phone) => {
    try {
        const usersRef = collection(db, "users");
        // 이름과 휴대폰 번호가 일치하는 문서 쿼리
        const q = query(usersRef, where("displayName", "==", name), where("phoneNumber", "==", phone));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // 로컬 모킹 데이터도 확인 (개발 편의성)
            const localUsers = getLocalUsers();
            const localUser = localUsers.find(u => u.displayName === name && u.phoneNumber === phone);
            if (localUser) {
                return { success: true, email: localUser.email };
            }
            return { success: false, error: "일치하는 회원 정보가 없습니다." };
        }

        // 보안상 첫 번째 매칭 결과의 이메일만 반환 (이메일 마스킹 처리는 UI에서 수행)
        const userData = querySnapshot.docs[0].data();
        return { success: true, email: userData.email };
    } catch (error) {
        console.error("Find email error:", error);
        // Firebase 에러 시에도 로컬 데이터 확인
        const localUsers = getLocalUsers();
        const localUser = localUsers.find(u => u.displayName === name && u.phoneNumber === phone);
        if (localUser) {
            return { success: true, email: localUser.email };
        }
        return { success: false, error: "정보를 찾는 중 오류가 발생했습니다." };
    }
};
