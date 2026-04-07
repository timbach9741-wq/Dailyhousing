import { create } from 'zustand';
import { db } from '../lib/firebase';
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

    // 파트너 추가 - Firestore 문서 추가 (실제 Auth 생성은 앱 로직에서 별도로 처리하거나 관리해야 함)
    addUser: async (newUser) => { // { id, name, role }
        try {
            const { users } = get();
            if (users.some(u => u.id === newUser.id)) {
                set({ error: '이미 존재하는 아이디입니다.' });
                return false;
            }

            const userDoc = doc(db, 'partner_users', newUser.id);
            await setDoc(userDoc, {
                name: newUser.name,
                role: newUser.role || 'staff',
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

    // Auth 비밀번호 수정은 클라이언트에서 불가능하므로 안내 처리
    // eslint-disable-next-line no-unused-vars
    updatePassword: async (userId, newPassword) => {
        alert("보안 정책상 현재 세션에서 다른 사용자의 Auth 비밀번호를 변경할 수 없습니다. 시스템 관리자에게 문의하세요.");
    },

    clearError: () => set({ error: null })
}));
