import { useEffect } from "react";
import Modal from "../Modal";

function MessageModal({ isOpen, message, onClose, duration = 1000 }) {
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
    <Modal xx={false}>
      <p className="py-5">{message}</p>
    </Modal>
  );
}

export default MessageModal;
