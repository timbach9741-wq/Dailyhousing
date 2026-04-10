import { create } from 'zustand';
import { db, auth, secondaryAuth } from '../lib/firebase';
import { updatePassword as firebaseUpdatePassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const usePartnerUserStore = create((set, get) => ({
    users: [],
    error: null,
    isLoaded: false,

    // Firestore에서 실시간으로 파트너 유저 불러오기
    initPartnerUsers: () => {
        const usersRef = collection(db, 'partner_users');
        
        // 구독 시작
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const users = [];
            snapshot.forEach(doc => {
                users.push({ ...doc.data(), id: doc.id });
            });
            set({ users, isLoaded: true, error: null });
        }, (error) => {
            console.error("Partner Users Snapshot Error:", error);
            // 권한이 없어서 실패하는 경우(비동기) 에러 처리
        });

        // 클린업 함수를 스토어에 보관
        set({ _unsubscribe: unsubscribe });
        return unsubscribe;
    },

    // 파트너 추가 - SecondaryAuth를 이용한 Auth 생성 및 Firestore 문서 추가
    addUser: async (newUser) => { // { id, name, role, password }
        try {
            const { users } = get();
            if (users.some(u => u.id === newUser.id)) {
                set({ error: '이미 존재하는 아이디입니다.' });
                return false;
            }

            // 1. Firebase Auth에 보조 앱 환경으로 계정 생성 (관리자 세션 만료 방지)
            const partnerEmail = `${newUser.id}@partner.dailyhousing.com`;
            try {
                await createUserWithEmailAndPassword(secondaryAuth, partnerEmail, newUser.password);
            } catch (authError) {
                console.error('Auth User Creation Error:', authError);
                if (authError.code === 'auth/email-already-in-use') {
                    set({ error: '이미 사용 중인 아이디입니다 (Auth 중복).' });
                } else if (authError.code === 'auth/weak-password') {
                    set({ error: '비밀번호는 최소 6자리 이상이어야 합니다.' });
                } else {
                    set({ error: '인증 계정 생성 중 오류가 발생했습니다.' });
                }
                return false;
            }

            // 2. Firestore에 직원 정보 문서 생성
            const userDoc = doc(db, 'partner_users', newUser.id);
            await setDoc(userDoc, {
                name: newUser.name,
                role: newUser.role || 'staff',
                canEditInventory: newUser.canEditInventory || false,
                createdAt: new Date().toISOString()
            });

            set({ error: null });
            return true;
        } catch (error) {
            console.error('Error adding user:', error);
            set({ error: '사용자 정보 기록에 실패했습니다.' });
            return false;
        }
    },

    // 유저 삭제 (문서 삭제)
    removeUser: async (userId) => {
        try {
            const userDoc = doc(db, 'partner_users', userId);
            await deleteDoc(userDoc);
        } catch (error) {
            console.error('Error removing user:', error);
            set({ error: '사용자 정보 삭제에 실패했습니다.' });
        }
    },

    // 정보 수정
    updateUser: async (userId, updates) => {
        try {
            const userDoc = doc(db, 'partner_users', userId);
            await updateDoc(userDoc, updates);
        } catch (error) {
            console.error('Error updating user:', error);
            set({ error: '사용자 정보 수정에 실패했습니다.' });
        }
    },

    // Auth 비밀번호 수정 로직 (본인 계정만 가능)
    updatePassword: async (userId, newPassword) => {
        try {
            const currentPartnerId = localStorage.getItem('partnerId');
            
            if (userId === currentPartnerId && auth.currentUser) {
                // 본인 비밀번호 변경
                await firebaseUpdatePassword(auth.currentUser, newPassword);
                alert("비밀번호가 성공적으로 변경되었습니다.");
            } else {
                alert("보안 정책상 현재 세션에서 다른 사용자의 비밀번호를 변경할 수 없습니다.\\n(본인의 비밀번호만 재설정 가능합니다.)");
            }
        } catch (error) {
            console.error("비밀번호 변경 실패:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("보안 정책으로 인해 최근에 로그인한 경우만 비밀번호를 변경할 수 있습니다.\\n로그아웃 후 다시 로그인하여 시도해주세요.");
            } else if (error.code === 'auth/weak-password') {
                alert("비밀번호는 최소 6자리 이상이어야 합니다.");
            } else {
                alert("비밀번호 변경 중 오류가 발생했습니다: " + error.message);
            }
        }
    },

    clearError: () => set({ error: null })
}));
