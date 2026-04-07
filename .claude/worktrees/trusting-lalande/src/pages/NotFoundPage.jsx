import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                <span className="material-symbols-outlined text-5xl text-slate-400">search_off</span>
            </div>
            <p className="mb-2 text-[13px] font-bold tracking-[0.3em] text-[#d4a853] uppercase">404 Not Found</p>
            <h1 className="mb-4 text-3xl font-black text-slate-900">페이지를 찾을 수 없습니다</h1>
            <p className="mb-10 text-[15px] font-normal text-slate-500 max-w-sm leading-relaxed">
                요청하신 페이지가 존재하지 않거나 이동되었습니다.<br />
                주소를 다시 확인해 주세요.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 rounded-xl border border-slate-200 text-[15px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    이전 페이지
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8923e] text-[15px] font-bold text-white shadow-lg shadow-[#d4a853]/20 hover:scale-105 transition-transform"
                >
                    홈으로 이동
                </button>
            </div>
        </main>
    );
}
