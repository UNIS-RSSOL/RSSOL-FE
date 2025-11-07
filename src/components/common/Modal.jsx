import XIcon from "../../assets/icons/XIcon";

function Modal({ children }) {
  return (
    <div className="fixed w-full min-[393px]:w-[393px] h-full top-0 left-1/2 -translate-x-1/2 bg-black/50 z-[9999] flex items-center justify-center">
      <div className="w-[310px] h-[130px] bg-white rounded-[20px] p-3 relative">
        <span className="absolute top-4 right-3">
          <XIcon />
        </span>
        {children}
      </div>
    </div>
  );
}

export default Modal;
