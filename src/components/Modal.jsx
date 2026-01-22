import XIcon from "../assets/newicons/XIcon";

function Modal({ className, children, onClose, xx = false }) {
  const x = xx;
  return (
    <div className="fixed w-full min-[393px]:w-[393px] h-full top-0 left-1/2 -translate-x-1/2 bg-black/50 z-[9999] flex items-center justify-center">
      <div
        className={`w-[310px] bg-white rounded-[20px] px-3 py-2 relative ${className}`}
      >
        <span className="absolute top-4 right-3" onClick={onClose}>
          {x && <XIcon className="cursor-pointer" />}
        </span>
        {children}
      </div>
    </div>
  );
}

export default Modal;
