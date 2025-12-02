import { useState, useEffect } from "react";
import {
  fetchStoreList,
  deleteStore,
  addStore,
} from "../../../services/employee/MyPageService.js";
import MessageModal from "../../../components/common/MessageModal.jsx";
import DeleteIcon from "../../../assets/icons/DeleteIcon.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import Modal from "../../../components/common/Modal.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import WhiteBtn from "../../../components/common/WhiteBtn.jsx";
import Toast from "../../../components/common/Toast.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";

function ManageStore() {
  const [storeList, setStoreList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletedStore, setDeletedStore] = useState();
  const [addToast, setAddToast] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [failModal, setFailModal] = useState(false);
  const [newStore, setNewStore] = useState({
    icon: <SaveIcon />,
    title: "매장 등록 코드",
    content: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchStoreList();

        const formattedList = response.map((store) => ({
          storeId: store.storeId,
          name: store.name,
        }));
        setStoreList(formattedList);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [addToast]);

  const StoreItem = ({ index, store }) => {
    return (
      <div className="flex flex-col w-full items-start justify-center">
        <p className="text-[14px] font-[600] text-left">등록 매장 {index}</p>
        <div className="flex flex-row w-full justify-between items-center border-b border-[#87888c] py-2">
          <p className="text-[18px] font-[600] text-left">{store.name}</p>
          <DeleteIcon
            onClick={() => {
              setDeleteModal(true);
              setDeletedStore(store);
            }}
          />
        </div>
      </div>
    );
  };

  //매장 삭제
  const handleDeleteStore = async () => {
    try {
      await deleteStore(deletedStore.storeId);
      setDeleteModal(false);
      setDeletedStore("");
    } catch (error) {
      console.error(error);
    }
  };

  //매장 추가
  const handleAddStore = async () => {
    try {
      console.log(newStore);
      const response = await addStore(newStore.content);
      if (response.success) {
        setAddToast(false);
        setSuccessModal(true);
      } else {
        setFailModal(true);
      }
      setNewStore([
        {
          icon: <SaveIcon />,
          title: "매장 등록 코드",
          content: "",
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-full py-20 px-5 gap-5">
      {storeList.map((store, index) => (
        <StoreItem key={index + 1} index={index + 1} store={store} />
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
              <WhiteBtn
                className="flex flex-1/2"
                onClick={() => {
                  setDeleteModal(false);
                  setDeletedStore("");
                }}
              >
                아니오
              </WhiteBtn>
              <GreenBtn className="flex flex-1/2" onClick={handleDeleteStore}>
                예
              </GreenBtn>
            </div>
          </div>
        </Modal>
      )}
      {addToast && (
        <Toast isOpen={addToast} onClose={() => setAddToast(false)}>
          <p className="text-[16px] font-[600]">매장 추가 등록</p>
          <div className="flex flex-col w-full gap-3 my-5">
            <div>
              <div className="flex flex-row w-full items-center gap-2">
                <div className="flex flex-shrink-0 items-center justify-center size-[40px]">
                  {newStore.icon}
                </div>
                <div className="flex flex-col w-full items-start gap-2">
                  <p className="text-[14px] font-[600] text-[#87888c] text-left">
                    {newStore.title}
                  </p>
                  <div className="flex flex-row items-center">
                    <p className="text-[18px] font-[600] mr-2">-</p>
                    <input
                      className="text-black text-[18px] font-[600]"
                      value={newStore.content}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const updatedStore = { ...newStore, content: newValue };
                        setNewStore(updatedStore);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="h-[12px] border-b border-[#87888c] ml-11 text-[10px] font-[400] text-[#f74a7a] text-left"></div>
            </div>
          </div>
          <GreenBtn
            className="py-6 text-[16px] font-[600]"
            onClick={handleAddStore}
          >
            추가하기
          </GreenBtn>
        </Toast>
      )}
      {failModal && (
        <Modal onClose={() => setFailModal(false)}>
          <p className="text-[14px] font-[500] my-4">
            입력하신 매장 등록 코드가 존재하지 않습니다
          </p>
        </Modal>
      )}
      <MessageModal
        isOpen={successModal}
        message="추가 완료되었어요!"
        onClose={() => setSuccessModal(false)}
      />
    </div>
  );
}

export default ManageStore;
