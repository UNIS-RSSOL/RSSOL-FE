import { useState, useEffect } from "react";
import {
  getOwnerStoreList,
  deleteOwnerStore,
  addOwnerStore,
} from "../../../services/new/MypageService.js";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import AddItem from "../../../components/common/mypage/AddItem.jsx";
import StoreItem from "../../../components/mypage/StoreItem.jsx";
import AddIcon from "../../../assets/newicons/AddIcon.jsx";
import Modal from "../../../components/Modal.jsx";
import Button from "../../../components/Button.jsx";
import Toast from "../../../components/Toast.jsx";
import TypeIcon from "../../../assets/newicons/TypeIcon.jsx";
import MarkerIcon from "../../../assets/newicons/MarkerIcon.jsx";
import PhoneIcon from "../../../assets/newicons/PhoneIcon.jsx";
import SaveIcon from "../../../assets/newicons/SaveIcon.jsx";
import CalendarIcon from "../../../assets/newicons/CalendarIcon.jsx";

function ManageStore() {
  const [storeList, setStoreList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletedStore, setDeletedStore] = useState({
    storeId: "",
    name: "",
  });
  const [addToast, setAddToast] = useState(false);
  const [newStore, setNewStore] = useState([
    {
      icon: <TypeIcon />,
      title: "매장 이름",
      content: "",
    },
    {
      icon: <MarkerIcon />,
      title: "매장 주소",
      content: "",
    },
    {
      icon: <PhoneIcon />,
      title: "매장 전화 번호",
      content: "",
    },
    {
      icon: <SaveIcon />,
      title: "사업자 등록 번호",
      content: "",
    },
    {
      icon: <CalendarIcon />,
      title: "입사날짜",
      content: "",
      type: "date",
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getOwnerStoreList();

        const formattedList = response.map((store) => ({
          storeId: store.storeId,
          name: store.name,
        }));
        setStoreList(formattedList);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [addToast, deleteModal]);

  const handleDeleteStore = async () => {
    try {
      await deleteOwnerStore(deletedStore.storeId);
      setDeleteModal(false);
      setDeletedStore("");
    } catch (error) {
      console.error(error);
    }
  };

  //매장 추가
  const handleAddStore = async () => {
    try {
      // 필수 필드 검증
      if (
        !newStore[0].content ||
        !newStore[1].content ||
        !newStore[2].content ||
        !newStore[3].content ||
        !newStore[4].content
      ) {
        alert("모든 정보를 입력해주세요.");
        return;
      }
      console.log(newStore);
      await addOwnerStore(
        newStore[0].content,
        newStore[1].content,
        newStore[2].content,
        newStore[3].content,
        newStore[4].content,
      );
      setAddToast(false);
      setNewStore([
        {
          icon: <TypeIcon />,
          title: "매장 이름",
          content: "",
        },
        {
          icon: <MarkerIcon />,
          title: "매장 주소",
          content: "",
        },
        {
          icon: <PhoneIcon />,
          title: "매장 전화 번호",
          content: "",
        },
        {
          icon: <SaveIcon />,
          title: "사업자 등록 번호",
          content: "",
        },
        {
          icon: <CalendarIcon />,
          title: "입사날짜",
          content: "",
          type: "date",
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      <TopBar title="내 매장 관리" />
      <div className="flex flex-col w-full my-10 px-5 gap-5">
        {storeList.map((store, index) => (
          <StoreItem
            key={index + 1}
            index={index + 1}
            store={store}
            onClick={() => {
              setDeleteModal(true);
              setDeletedStore(store);
            }}
          />
        ))}
        <div
          className="flex flex-row items-center justify-center my-2 gap-3 cursor-pointer"
          onClick={() => setAddToast(true)}
        >
          <AddIcon />
          <p className="text-[16px] font-[500]">매장 추가 등록</p>
        </div>
        {deleteModal && (
          <Modal
            xx={true}
            onClose={() => {
              setDeleteModal(false);
            }}
          >
            <div className="flex flex-col justify-center w-full py-3 px-1 gap-5">
              <div className="text-[14px] font-[500] text-center mt-2">
                <p>'{deletedStore.name}'을 내 매장에서</p>
                <p>삭제할까요?</p>
              </div>
              <div className="flex flex-row w-full items-center gap-2">
                <Button
                  className="flex flex-1/2 w-[136px] h-[33px] bg-[#fdfffe] border-[1px] border-black"
                  onClick={() => {
                    setDeleteModal(false);
                    setDeletedStore("");
                  }}
                >
                  아니오
                </Button>
                <Button
                  className="flex flex-1/2 w-[136px] h-[33px]"
                  onClick={handleDeleteStore}
                >
                  예
                </Button>
              </div>
            </div>
          </Modal>
        )}
        {addToast && (
          <Toast isOpen={addToast} onClose={() => setAddToast(false)}>
            <p className="text-[16px] font-[600]">매장 추가 등록</p>
            <div className="flex flex-col w-full gap-3 my-5">
              {newStore.map((store, index) => (
                <AddItem
                  key={index}
                  data={store}
                  index={index}
                  onChange={(index, value) => {
                    const updatedStore = [...newStore];
                    updatedStore[index] = {
                      ...updatedStore[index],
                      content: value,
                    };
                    setNewStore(updatedStore);
                  }}
                />
              ))}
            </div>
            <Button
              className="w-[361px] h-[48px] text-[16px] font-[600]"
              onClick={handleAddStore}
            >
              추가하기
            </Button>
          </Toast>
        )}
      </div>
    </div>
  );
}

export default ManageStore;
