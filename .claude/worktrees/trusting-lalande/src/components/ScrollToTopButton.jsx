import { useState, useEffect } from "react";

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="맨 위로 이동"
            className={`
                fixed bottom-24 right-6 z-50
                w-12 h-12 rounded-full
                bg-[#333] hover:bg-[#555] active:bg-[#111]
                text-white shadow-lg hover:shadow-xl
                flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
            `}
            style={{ backdropFilter: "blur(8px)" }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="18 15 12 9 6 15" />
            </svg>
        </button>
    );
}
