import StoreItem from "../../../components/common/mypage/StoreItem.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import Modal from "../../../components/common/Modal.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import WhiteBtn from "../../../components/common/WhiteBtn.jsx";
import { useEffect, useState } from "react";
import Toast from "../../../components/common/Toast.jsx";
import InfoItem from "../../../components/common/mypage/InfoItem.jsx";
import TypeIcon from "../../../assets/icons/TypeIcon.jsx";
import MapIcon from "../../../assets/icons/MapIcon.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";
import {
  fetchStoreList,
  addStore,
  deleteStore,
} from "../../../services/owner/MyPageService.js";

function ManageStore({ isOwner }) {
  const [storeList, setStoreList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [deletedStore, setDeletedStore] = useState(null);
  const [newStore, setNewStore] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const storeList = await fetchStoreList();
        setStoreList(storeList);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleAddStore = async (
    businessRegistrationNumber,
    name,
    address,
    phoneNumber,
  ) => {
    try {
      await addStore(businessRegistrationNumber, name, address, phoneNumber);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStore = async () => {
    if (!deletedStore) return;

    try {
      await deleteStore(deletedStore.storeId);
      // Update the store list by filtering out the deleted store
      setStoreList((prev) =>
        prev.filter((store) => store.storeId !== deletedStore.storeId),
      );
      setIsModalOpen(false);
      setDeletedStore(null);
    } catch (error) {
      console.error("매장 삭제 중 오류가 발생했습니다:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewStore((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full justify-items-center pt-10 pl-3 pr-3">
      {storeList && (
        <div className="flex flex-col w-full">
          {storeList.map((store, index) => (
            <StoreItem
              key={store.storeId}
              num={index + 1}
              name={store.name}
              onClick={() => {
                setIsModalOpen(true);
                setDeletedStore(store);
              }}
            />
          ))}
        </div>
      )}
      <div
        className="flex flex-row items-center mt-4 cursor-pointer"
        onClick={() => setIsToastOpen(true)}
      >
        <AddIcon />
        <p className="text-[16px] font-medium pl-5">매장 추가 등록</p>
      </div>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="w-3/4 text-center text-[14px]/[24px] font-medium">
              '{deletedStore.name}'을 내 매장에서 삭제할까요?
            </p>
            <div className="w-full flex flex-row items-center gap-2 mt-3">
              <div className="flex-1">
                <WhiteBtn onClick={() => setIsModalOpen(false)}>
                  아니오
                </WhiteBtn>
              </div>
              <div className="flex-1">
                <GreenBtn
                  onClick={() => {
                    handleDeleteStore(deletedStore.storeId);
                  }}
                >
                  예
                </GreenBtn>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <Toast isOpen={isToastOpen} onClose={() => setIsToastOpen(false)}>
        <p className="text-[16px] font-semibold">매장 추가 등록</p>
        {isOwner ? (
          <div className="flex flex-col">
            <InfoItem
              icon={<TypeIcon />}
              title="매장 이름"
              isEdit={true}
              required={true}
              value={newStore.name}
              onChange={handleInputChange}
              name="name"
            />
            <InfoItem
              icon={<MapIcon />}
              title="매장 주소"
              isEdit={true}
              required={true}
              value={newStore.address}
              onChange={handleInputChange}
              name="address"
            />
            <InfoItem
              icon={<PhoneIcon />}
              title="매장 전화 번호"
              isEdit={true}
              required={true}
              value={newStore.phoneNumber}
              onChange={handleInputChange}
              name="phoneNumber"
            />
            <InfoItem
              icon={<SaveIcon />}
              title="사업자 등록 번호"
              isEdit={true}
              value={newStore.businessRegistrationNumber}
              onChange={handleInputChange}
              name="businessRegistrationNumber"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <InfoItem
              icon={<SaveIcon />}
              title="매장 등록 코드"
              isEdit={true}
            />
          </div>
        )}
        <GreenBtn
          className="h-[50px] text-[16px] font-semibold mt-5"
          onClick={() => {
            handleAddStore(
              newStore.businessRegistrationNumber,
              newStore.name,
              newStore.address,
              newStore.phoneNumber,
            );
            setIsToastOpen(false);
          }}
        >
          추가하기
        </GreenBtn>
      </Toast>
      {isModalOpen2 && (
        <Modal>
          <p className="text-[14px] font-medium mx-3 my-4">
            입력하신 매장 등록 코드가 존재하지 않습니다.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default ManageStore;
