import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoreIcon from "../../assets/newicons/StoreIcon.jsx";
import { changeActiveStore } from "../../services/new/MypageService.js";

function FloatButton({ stores, active, onActiveStoreChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [storeList, setStoreList] = useState();
  const [activeStore, setActiveStore] = useState();

  useEffect(() => {
    setStoreList(stores);
    setActiveStore(active);
  }, [stores, active]);

  const handleChangeActive = async (storeId) => {
    try {
      const response = await changeActiveStore(storeId);
      const newActiveStore = { storeId: response.storeId, name: response.name };
      setActiveStore(newActiveStore);
      onActiveStoreChange && onActiveStoreChange(newActiveStore);
      setIsOpen(false);
      console.log({ storeId: response.storeId, name: response.name });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed bottom-[80px] right-[calc(50%-196.5px+24px)] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {storeList.map((store) => (
              <motion.div
                key={store.storeId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center text-[10px] font-[500] size-[48px] rounded-full bg-white border-2 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] cursor-pointer ${
                  Number(store.storeId) === Number(activeStore?.storeId)
                    ? "border-[#68e194]"
                    : "border-black"
                }`}
                onClick={() => handleChangeActive(store.storeId)}
              >
                {store.name}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05, backgroundColor: "#fff" }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center size-[48px] rounded-full bg-[#68e194] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <StoreIcon className={isOpen ? "text-[#68e194]" : "text-white"} />
      </motion.div>
    </div>
  );
}

export default FloatButton;
