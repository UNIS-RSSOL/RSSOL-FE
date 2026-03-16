import { useEffect } from "react";
import Modal from "./Modal";

function MessageModal({ isOpen, message, children, onClose, duration = 1000 }) {
  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <Modal className="py-5 px-10" xx={false}>
      <p>{message || children}</p>
    </Modal>
  );
}

export default MessageModal;
