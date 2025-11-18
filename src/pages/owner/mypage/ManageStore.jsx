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

function ManageStore({ isOwner }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {}, [isToastOpen]);

  return (
    <div className="w-full justify-items-center pt-10 pl-3 pr-3">
      <div className="flex flex-col w-full">
        <StoreItem num={1} name="알바 솔로몬 1호점" />
        <StoreItem num={2} name="알바 솔로몬 2호점" />
        <StoreItem num={3} name="알바 솔로몬 3호점" />
        <StoreItem num={4} name="알바 솔로몬 4호점" />
      </div>

      <div 
        className="flex flex-row items-center mt-4 cursor-pointer"
        onClick={() => setIsToastOpen(true)}
      >
        <AddIcon />
        <p className="text-[16px] font-medium pl-5">
          매장 추가 등록
        </p>
      </div>
      {isModalOpen && (
        <Modal>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="w-3/4 text-center text-[14px]/[24px] font-medium">
              '알바 솔로몬 1호점'을 내 매장에서 삭제할까요?
            </p>
            <div className="w-full flex flex-row items-center gap-2 mt-3">
              <div className="flex-1">
                <WhiteBtn onClick={() => setIsModalOpen(false)}>
                  아니오
                </WhiteBtn>
              </div>
              <div className="flex-1">
                <GreenBtn>예</GreenBtn>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {isToastOpen && (
        <Toast>
          <p className="text-[16px] font-semibold">매장 추가 등록</p>
          {isOwner ? (
            <div className="flex flex-col">
              <InfoItem icon={<TypeIcon />} title="매장 이름" isEdit={true} />
              <InfoItem icon={<MapIcon />} title="매장 주소" isEdit={true} />
              <InfoItem
                icon={<PhoneIcon />}
                title="매장 전화 번호"
                isEdit={true}
              />
              <InfoItem
                icon={<SaveIcon />}
                title="사업자 등록 번호"
                isEdit={true}
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
          <GreenBtn className="h-[50px] text-[16px] font-semibold mt-5">
            추가하기
          </GreenBtn>
        </Toast>
      )}
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
