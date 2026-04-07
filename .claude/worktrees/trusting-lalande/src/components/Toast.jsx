import { useToastStore } from '../store/useToastStore';

export default function Toast() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className="flex items-center gap-3 px-5 py-4 bg-slate-900 dark:bg-slate-800 text-white shadow-xl rounded-xl pointer-events-auto transform transition-all animate-[slideIn_0.3s_ease-out_forwards]"
                    role="alert"
                >
                    {toast.type === 'success' ? (
                        <span className="material-symbols-outlined text-primary dark:text-accent">check_circle</span>
                    ) : toast.type === 'error' ? (
                        <span className="material-symbols-outlined text-red-400">error</span>
                    ) : (
                        <span className="material-symbols-outlined text-blue-400">info</span>
                    )}
                    <p className="text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            ))}
            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
