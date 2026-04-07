import React, { useState } from 'react';
import { usePartnerUserStore } from '../../store/usePartnerUserStore';

const PartnerUserManageModal = ({ isOpen, onClose }) => {
    const store = usePartnerUserStore();
    const { users, removeUser, updatePassword } = store;
    
    const [newId, setNewId] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [localError, setLocalError] = useState('');
    
    // 비밀번호 수정용 상태
    const [editingUserId, setEditingUserId] = useState(null);
    const [editPassword, setEditPassword] = useState('');

    if (!isOpen) return null;

    const handleAddUser = (e) => {
        e.preventDefault();
        if (!newId || !newName || !newPassword) {
            setLocalError('모든 필드를 입력해주세요.');
            return;
        }

        store.clearError();
        store.addUser({
            id: newId,
            name: newName,
            password: newPassword
        });

        // setTimeout 없이 동기적으로 Zustand store가 갱신됨 (하지만 error 체크를 위해 getState 사용)
        const currentError = usePartnerUserStore.getState().error;
        if (currentError) {
            setLocalError(currentError);
        } else {
            setNewId('');
            setNewName('');
            setNewPassword('');
            setLocalError('');
        }
    };

    const handleUpdatePassword = (userId) => {
        if (!editPassword) return;
        updatePassword(userId, editPassword);
        setEditingUserId(null);
        setEditPassword('');
    };

    const handleRemoveUser = (userId) => {
        if(window.confirm('정말 이 계정을 삭제하시겠습니까?')) {
            removeUser(userId);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">직원 계정 관리</h2>
                        <p className="text-sm text-gray-500 mt-1">대시보드에 접속할 수 있는 계정을 관리합니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {/* 계정 추가 폼 */}
                    <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 mb-8">
                        <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-2 2 3 4 3 6v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            신규 계정 추가
                        </h3>
                        <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="아이디"
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="이름 (예: 홍길동 대리)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="초기 비밀번호"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors whitespace-nowrap">
                                추가하기
                            </button>
                        </form>
                        {localError && <p className="text-red-500 text-xs mt-2 font-medium ml-1">{localError}</p>}
                    </div>

                    {/* 계정 목록 테이블 */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 ml-1">등록된 계정 목록 ({users.length}개)</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-600 w-24">권한</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">이름</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">아이디</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">비밀번호 관리</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-center w-20">삭제</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {user.role === 'admin' ? '최고관리자' : '직원'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                                            <td className="px-4 py-3 font-mono text-gray-500">{user.id}</td>
                                            <td className="px-4 py-3">
                                                {editingUserId === user.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="새 비밀번호" 
                                                            value={editPassword}
                                                            onChange={(e) => setEditPassword(e.target.value)}
                                                            className="px-2 py-1.5 border border-gray-300 rounded text-xs w-32 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            autoFocus
                                                        />
                                                        <button 
                                                            onClick={() => handleUpdatePassword(user.id)}
                                                            className="text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded text-xs font-bold transition-colors"
                                                        >
                                                            저장
                                                        </button>
                                                        <button 
                                                            onClick={() => { setEditingUserId(null); setEditPassword(''); }}
                                                            className="text-gray-500 hover:bg-gray-200 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-400 font-mono tracking-widest">••••••</span>
                                                        <button 
                                                            onClick={() => setEditingUserId(user.id)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                                                        >
                                                            재설정
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    disabled={user.role === 'admin'} // 최고 관리자는 삭제 불가
                                                    className={`p-1.5 rounded-lg transition-colors ${user.role === 'admin' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                                    title={user.role === 'admin' ? "최고 관리자는 삭제할 수 없습니다" : "계정 삭제"}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 flex items-center justify-end gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            최고관리자 본인의 아이디는 삭제할 수 없으며 비밀번호 재설정만 가능합니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerUserManageModal;
