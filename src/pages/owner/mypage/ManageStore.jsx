import { useState, useEffect } from "react";
import {
  fetchStoreList,
  deleteStore,
  addStore,
} from "../../../services/owner/MyPageService.js";
import AddItem from "../../../components/common/mypage/AddItem.jsx";
import DeleteIcon from "../../../assets/icons/DeleteIcon.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import Modal from "../../../components/common/Modal.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import WhiteBtn from "../../../components/common/WhiteBtn.jsx";
import Toast from "../../../components/common/Toast.jsx";
import TypeIcon from "../../../assets/icons/TypeIcon.jsx";
import MapIcon from "../../../assets/icons/MapIcon.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";

function ManageStore() {
  const [storeList, setStoreList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletedStore, setDeletedStore] = useState();
  const [addToast, setAddToast] = useState(false);
  const [newStore, setNewStore] = useState([
    {
      icon: <TypeIcon />,
      title: "매장 이름",
      content: "",
    },
    {
      icon: <MapIcon />,
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
  ]);

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
  }, []);

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
      await addStore(
        newStore[3].content,
        newStore[0].content,
        newStore[1].content,
        newStore[2].content,
      );
      setAddToast(false);
      setNewStore([
        {
          icon: <TypeIcon />,
          title: "매장 이름",
          content: "",
        },
        {
          icon: <MapIcon />,
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
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-full py-20 px-5 gap-5">
      {storeList.map((store, index) => (
        <StoreItem index={index + 1} store={store} />
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
          <GreenBtn
            className="py-6 text-[16px] font-[600]"
            onClick={handleAddStore}
          >
            추가하기
          </GreenBtn>
        </Toast>
      )}
    </div>
  );
}

export default ManageStore;
