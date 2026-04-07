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
import { recordSignupToSheets } from './googleSheetsService';

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
                // Firebase Custom Claims에서 admin 여부 확인
                const tokenResult = await user.getIdTokenResult();
                const isAdmin = !!tokenResult.claims.admin;

                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};
                const role = isAdmin ? 'admin' : (userData.role || 'individual');
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userData.displayName || (role === 'admin' ? '관리자' : '사용자'),
                    role,
                    businessInfo: userData.businessInfo || null,
                    phoneNumber: userData.phoneNumber || '',
                    address: userData.address || ''
                });
            } catch (error) {
                console.error('❌ initAuthListener - 사용자 정보 로드 실패:', error);
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '사용자',
                    role: 'individual'
                });
            }
        } else {
            // 파이어베이스 세션이 없으면 로컬 세션 확인
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

        // Firebase Custom Claims에서 admin 여부 확인
        try {
            const tokenResult = await fbUser.getIdTokenResult();
            if (tokenResult.claims.admin) {
                userData.role = 'admin';
                userData.displayName = userData.displayName || '관리자';
            }
        } catch (error) {
            console.warn('⚠️ login - Custom Claims 확인 실패 (Firestore role 유지):', error);
        }

        // 승인 대기 회원 차단 (관리자는 스킵, 기존 회원은 approved 필드 없으면 승인된 것으로 간주)
        if (userData.role !== 'admin' && userData.approved === false) {
            await signOut(auth);
            return { success: false, error: '가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.', pendingApproval: true };
        }

        setLocalSession(userData);
        useAuthStore.getState().setUser(userData);

        return { success: true, user: userData };
    } catch (error) {
        console.error('❌ login - Firebase 인증 실패:', error?.code, error?.message);
        return { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." };
    }
};

// 회원가입
export const signup = async (email, password, displayName, role = 'individual', businessInfo = null, phoneNumber = '') => {
    // 사업자 회원: 국세청 인증 통과 + 등록증 파일 업로드 시 자동 승인
    const isBusiness = role === 'business';
    const autoApproved = isBusiness && businessInfo?.ntsVerified && businessInfo?.licenseUrl;
    const needsApproval = isBusiness && !autoApproved;

    try {
        // 1. 파이어베이스 회원가입 시도
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName });

        const userData = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: displayName,
            role: role,
            businessInfo: isBusiness ? businessInfo : null,
            phoneNumber: phoneNumber,
            approved: !needsApproval // 개인: true, 사업자: false
        };

        // Firestore에 사용자 정보 저장
        try {
            await setDoc(doc(db, "users", fbUser.uid), {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: displayName,
                role: role,
                businessInfo: isBusiness ? businessInfo : null,
                phoneNumber: phoneNumber,
                approved: !needsApproval,
                createdAt: new Date().toISOString()
            });
            console.log('✅ Firestore 사용자 문서 저장 성공:', fbUser.uid);
        } catch (fsErr) {
            console.error("❌ Firestore user doc creation failed:", fsErr?.code, fsErr?.message, fsErr);
        }

        // 로컬 스토리지에도 항상 백업 저장 (관리자 조회용)
        saveLocalUser({
            ...userData,
            createdAt: new Date().toISOString()
        });

        // Google Sheets에 회원정보 기록 (비동기, 실패해도 무시)
        recordSignupToSheets(userData).catch(() => {});

        if (needsApproval) {
            // 사업자 회원: 승인 대기 → 로그아웃 처리
            await signOut(auth);
            return { success: true, pendingApproval: true, user: userData };
        } else {
            // 개인 회원: 즉시 로그인 상태 유지
            setLocalSession(userData);
            useAuthStore.getState().setUser(userData);
            return { success: true, pendingApproval: false, user: userData };
        }
    } catch (firebaseErr) {
        console.warn("Firebase Auth failed, switching to Local Auth mode:", firebaseErr?.message);

        // 2. 파이어베이스 실패 시 로컬 모드로 강제 성공 처리
        const localUsers = getLocalUsers();
        if (localUsers.find(u => u.email === email)) {
            return { success: false, error: "이미 존재하는 이메일입니다." };
        }

        const newUser = {
            uid: `local_${Date.now()}`,
            email,
            displayName,
            role,
            businessInfo: isBusiness ? businessInfo : null,
            phoneNumber,
            approved: !needsApproval,
            createdAt: new Date().toISOString()
        };

        saveLocalUser(newUser);

        // Google Sheets에 회원정보 기록 (비동기, 실패해도 무시)
        recordSignupToSheets(newUser).catch(() => {});

        if (needsApproval) {
            return { success: true, pendingApproval: true, user: newUser };
        } else {
            setLocalSession(newUser);
            useAuthStore.getState().setUser(newUser);
            return { success: true, pendingApproval: false, user: newUser };
        }
    }
};

// 로그아웃
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.warn('⚠️ logout - Firebase 로그아웃 실패:', error);
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
