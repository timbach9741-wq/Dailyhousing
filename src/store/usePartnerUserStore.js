import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePartnerUserStore = create(
    persist(
        (set, get) => ({
            // 초기 마스터(관리자) 계정 및 샘플 직원 계정
            users: [
                { 
                    id: '이광연', 
                    password: '123456', 
                    name: '이광연 (대표)', 
                    role: 'admin',
                    createdAt: new Date().toISOString()
                }
            ],

            // 로그인 검증 함수
            verifyUser: (userId, password) => {
                const { users } = get();
                const matchedUser = users.find(u => u.id === userId && u.password === password);
                if (matchedUser) {
                    return { success: true, user: { id: matchedUser.id, name: matchedUser.name, role: matchedUser.role } };
                }
                return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
            },

            // 직원 추가 (관리자 전용 기능)
            addUser: (newUser) => set((state) => {
                // 중복 아이디 체크
                if (state.users.some(u => u.id === newUser.id)) {
                    return { error: '이미 존재하는 아이디입니다.' };
                }
                return { 
                    users: [...state.users, { ...newUser, role: 'staff', createdAt: new Date().toISOString() }],
                    error: null
                };
            }),

            // 직원 (또는 특정 계정) 삭제
            removeUser: (userId) => set((state) => ({
                users: state.users.filter(u => u.id !== userId)
            })),

            // 비밀번호 변경 (본인 비밀번호 및 직원 비밀번호 수정용)
            updatePassword: (userId, newPassword) => set((state) => ({
                users: state.users.map(u => 
                    u.id === userId ? { ...u, password: newPassword } : u
                )
            })),
            
            // 이름 등 기타 정보 수정
            updateUser: (userId, updates) => set((state) => ({
                users: state.users.map(u => 
                    u.id === userId ? { ...u, ...updates } : u
                )
            })),

            // 초기화(에러)
            clearError: () => set({ error: null })
        }),
        {
            name: 'partner-user-storage' // 로컬 스토리지 키
        }
    )
);
