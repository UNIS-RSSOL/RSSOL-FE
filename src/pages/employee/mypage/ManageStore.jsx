import { useState, useEffect } from "react";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import MessageModal from "../../../components/common/MessageModal.jsx";
import StoreItem from "../../../components/mypage/StoreItem.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import Modal from "../../../components/common/Modal.jsx";
import Button from "../../../components/common/Button.jsx";
import Toast from "../../../components/common/Toast.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";
import CalendarIcon from "../../../assets/icons/CalendarIcon.jsx";
import AddItem from "../../../components/mypage/AddItem.jsx";
import {
  getStaffStoreList,
  deleteStaffStore,
  addStaffStore,
} from "../../../services/MypageService.js";

function ManageStore() {
  const [storeList, setStoreList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletedStore, setDeletedStore] = useState({
    storeId: "",
    name: "",
  });
  const [addToast, setAddToast] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [failModal, setFailModal] = useState(false);
  const [newStore, setNewStore] = useState([
    {
      icon: <SaveIcon />,
      title: "매장 등록 코드",
      content: "",
    },
    {
      icon: <CalendarIcon />,
      title: "입사 날짜",
      content: "",
      type: "date",
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getStaffStoreList();

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

  //매장 삭제
  const handleDeleteStore = async () => {
    try {
      await deleteStaffStore(deletedStore.storeId);
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
      if (!newStore[0].content || !newStore[1].content) {
        alert("매장 등록 코드와 입사날짜를 모두 입력해주세요.");
        return;
      }
      console.log(newStore);
      await addStaffStore(newStore[0].content, newStore[1].content);
      setAddToast(false);
      setSuccessModal(true);

      setNewStore(
        {
          icon: <SaveIcon />,
          title: "매장 등록 코드",
          content: "",
        },
        {
          icon: <CalendarIcon />,
          title: "입사 날짜",
          content: "",
          type: "date",
        },
      );
    } catch (error) {
      console.error(error);
      setFailModal(true);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <TopBar title="등록 매장 관리" />
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
              <div className="text-[14px] font-[500] text-center">
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
                  {" "}
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
        {failModal && (
          <Modal xx={true} onClose={() => setFailModal(false)}>
            <p className="text-[14px] font-[500] my-3 mx-5">
              입력하신 매장 등록 코드가 존재하지 않습니다
            </p>
          </Modal>
        )}
        <MessageModal
          isOpen={successModal}
          onClose={() => setSuccessModal(false)}
        >
          추가 완료되었어요!
        </MessageModal>
      </div>
    </div>
  );
}

export default ManageStore;
