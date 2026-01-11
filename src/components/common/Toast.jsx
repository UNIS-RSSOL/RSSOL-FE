import { useEffect, useRef, useState } from "react";

function Toast({ children, isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      // Start closing animation
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300); // Match this with the animation duration

      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 " onClick={handleBackdropClick}>
      <div
        ref={toastRef}
        className={`fixed bottom-0 left-1/2 w-full max-w-[393px] bg-[#fdfffe] flex flex-col p-5 rounded-t-2xl shadow-[0px_-1px_20px_0px_rgba(0,0,0,0.25)] ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
        style={{
          transform: "translateX(-50%)",
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%) translateX(-50%);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
          to {
            transform: translateY(100%) translateX(-50%);
            opacity: 0;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Toast;
