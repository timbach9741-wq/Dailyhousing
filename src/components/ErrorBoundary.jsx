import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-white px-6 text-center">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#d4a853]/10 text-[#d4a853]">
                        <span className="material-symbols-outlined text-[40px]">warning</span>
                    </div>
                    <h2 className="mb-4 text-3xl font-black text-slate-900 lg:text-4xl">
                        페이지를 불러오는 중<br />오류가 발생했습니다
                    </h2>
                    <p className="mb-10 max-w-md text-lg font-medium text-slate-500 leading-relaxed">
                        일시적인 오류이거나 존재하지 않는 페이지일 수 있습니다.<br />
                        아래 버튼을 눌러 홈으로 이동하거나 새로고침 해주세요.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm"
                        >
                            새로고침
                        </button>
                        <Link
                            to="/"
                            onClick={() => this.setState({ hasError: false })}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8923e] px-8 py-4 font-bold text-white shadow-xl shadow-[#d4a853]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            홈으로 이동하기
                        </Link>
                    </div>
                    {import.meta.env.DEV && (
                        <div className="mt-12 max-w-2xl overflow-auto rounded-xl bg-slate-50 p-6 text-left text-xs text-slate-400 border border-slate-100">
                            <p className="font-bold mb-2 text-slate-600">Error Detail (Dev Only):</p>
                            <pre>{this.state.error?.toString()}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
