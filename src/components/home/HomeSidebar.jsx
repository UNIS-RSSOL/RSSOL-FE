import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import LeftArrowIcon from "../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../assets/icons/RightArrowIcon.jsx";
import logoImg from "../../assets/images/logo-default.svg";
import { logout } from "../../services/AuthService.js";
import {
  changeActiveStore,
  getOwnerStoreList,
  getStaffStoreList,
} from "../../services/MypageService.js";

function HomeSidebar({
  isOpen,
  onClose,
  activeStore,
  setActiveStore,
  role,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const [storeList, setStoreList] = useState([]);
  const menuItems =
    role === "OWNER"
      ? [
          {
            label: "직원관리",
            onClick: () => {
              setSidebarOpen(false);
              navigate("/owner/manage/employee");
            },
          },
          {
            label: "급여관리",
            onClick: () => {
              setSidebarOpen(false);
              navigate("/owner/manage/wage");
            },
          },
        ]
      : [
          {
            label: "급여관리",
            onClick: () => {
              setSidebarOpen(false);
              navigate("/employee/manage");
            },
          },
        ];

  useEffect(() => {
    (async () => {
      try {
        if (role === "OWNER") {
          const res = await getOwnerStoreList();
          setStoreList(res);
        } else {
          const res = await getStaffStoreList();
          setStoreList(res);
        }
      } catch (error) {
        console.error("매장 목록 조회 실패:", error);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setSidebarOpen(false);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleMypage = () => {
    setSidebarOpen(false);
    navigate(`/${role.toLowerCase()}/mypage`);
  };

  const handleStoreChange = async (newStore) => {
    try {
      setSidebarOpen(false);
      await changeActiveStore(newStore.storeId);
      setActiveStore(newStore);
    } catch (error) {
      console.error("매장 변경 실패:", error);
    }
  };

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
              {role === "OWNER" ? (
                <div className="flex items-center justify-between mb-[24px]">
                  <h2 className="text-[22px] font-[700] text-left">
                    {activeStore.name || "매장 이름"}
                  </h2>
                  <div
                    className="cursor-pointer p-[4px]"
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate("/owner/store-settings");
                    }}
                  >
                    <Settings size={20} strokeWidth={1.5} color="black" />
                  </div>
                </div>
              ) : (
                <h2 className="text-[22px] font-[700] mb-[24px] text-left">
                  {activeStore.name || "매장 이름"}
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
                    onClick={() => handleStoreChange(store)}
                    className={`text-[16px] py-[4px] cursor-pointer text-left ${
                      Number(store.storeId) === Number(activeStore.storeId)
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
                <span>1 / {Math.max(1, Math.ceil(storeList.length / 5))}</span>
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
                  <span className="cursor-pointer" onClick={handleMypage}>
                    내 정보 수정
                  </span>
                  <span>|</span>
                  <span className="cursor-pointer" onClick={handleLogout}>
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
