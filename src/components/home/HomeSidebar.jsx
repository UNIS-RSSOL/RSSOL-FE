import { AnimatePresence, motion } from "framer-motion";
import LeftArrowIcon from "../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../assets/icons/RightArrowIcon.jsx";
import logoImg from "../../assets/images/logo-default.svg";

function HomeSidebar({
  isOpen,
  onClose,
  storeName,
  titleExtra,
  menuItems,
  storeList,
  activeStoreId,
  onStoreChange,
  onMyPage,
  onLogout,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 left-0 w-[280px] h-full bg-white z-50 flex flex-col"
          >
            <div className="flex-1 flex flex-col px-[16px] pt-[40px] pb-[24px]">
              {titleExtra ? (
                <div className="flex items-center justify-between mb-[24px]">
                  <h2 className="text-[22px] font-[700] text-left">
                    {storeName || "매장 이름"}
                  </h2>
                  {titleExtra}
                </div>
              ) : (
                <h2 className="text-[22px] font-[700] mb-[24px] text-left">
                  {storeName || "매장 이름"}
                </h2>
              )}

              {menuItems.map((item, i) => (
                <p
                  key={i}
                  onClick={item.onClick}
                  className="text-[16px] py-[8px] cursor-pointer text-left"
                >
                  {item.label}
                </p>
              ))}

              <hr className="my-[16px] border-[#E7EAF3]" />

              <p className="text-[18px] font-[700] mb-[12px] text-left">
                매장전환
              </p>
              <div className="flex flex-col gap-[8px]">
                {storeList.map((store) => (
                  <p
                    key={store.storeId}
                    onClick={() => onStoreChange(store.storeId)}
                    className={`text-[16px] py-[4px] cursor-pointer text-left ${
                      Number(store.storeId) === Number(activeStoreId)
                        ? "font-[600]"
                        : "font-[400]"
                    }`}
                  >
                    {store.name}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-center gap-[16px] mt-[20px] text-[16px] text-[#87888c]">
                <LeftArrowIcon color="#87888c" className="cursor-pointer" />
                <span>
                  1 / {Math.max(1, Math.ceil(storeList.length / 5))}
                </span>
                <RightArrowIcon className="cursor-pointer" />
              </div>

              <div className="mt-auto flex flex-col items-center gap-[16px]">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={logoImg}
                    alt="알쏠 로고"
                    className="h-[40px] object-contain"
                  />
                </div>
                <div className="flex items-center gap-[8px] text-[13px] text-[#87888c]">
                  <span className="cursor-pointer" onClick={onMyPage}>
                    내 정보 수정
                  </span>
                  <span>|</span>
                  <span className="cursor-pointer" onClick={onLogout}>
                    로그아웃
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default HomeSidebar;
