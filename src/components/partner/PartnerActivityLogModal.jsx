import React, { useEffect } from 'react';
import { usePartnerLogStore } from '../../store/usePartnerLogStore';

const PartnerActivityLogModal = ({ isOpen, onClose }) => {
    const { logs, initLogs } = usePartnerLogStore();

    useEffect(() => {
        if (isOpen) {
            const unsubscribe = initLogs();
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [isOpen, initLogs]);

    if (!isOpen) return null;

    const getActionLabel = (type) => {
        switch (type) {
            case 'LOGIN': return '로그인';
            case 'UPDATE_INVENTORY': return '재고/상태 변경';
            default: return type;
        }
    };

    const getActionColor = (type) => {
        switch (type) {
            case 'LOGIN': return 'bg-blue-100 text-blue-700';
            case 'UPDATE_INVENTORY': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">활동 로그</h2>
                        <p className="text-sm text-gray-500 mt-1">계정별 최근 수행한 작업 및 접속 내용을 확인합니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap w-40">발생 일시</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap w-24">작업 구분</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap w-32">수행자</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">상세 내용</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">기록된 활동 로그가 없습니다.</td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-gray-500 text-xs whitespace-nowrap">{formatDate(log.timestamp)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getActionColor(log.actionType)}`}>
                                                    {getActionLabel(log.actionType)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                                                {log.userName} <span className="text-xs text-gray-400">({log.userId})</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 break-keep">{log.details}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerActivityLogModal;
