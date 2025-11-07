import StoreItem from "../../../components/common/mypage/StoreItem.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import Modal from "../../../components/common/Modal.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import WhiteBtn from "../../../components/common/WhiteBtn.jsx";

function ManageStore() {
  return (
    <div className="w-full justify-items-center pt-10 pl-3 pr-3">
      <div className="flex flex-col w-full">
        <StoreItem num={1} name="알바 솔로몬 1호점" />
        <StoreItem num={2} name="알바 솔로몬 2호점" />
        <StoreItem num={3} name="알바 솔로몬 3호점" />
        <StoreItem num={4} name="알바 솔로몬 4호점" />
      </div>

      <div className="flex flex-row items-center mt-4 cursor-pointer">
        <AddIcon />
        <p className="text-[16px] font-medium pl-5">매장 추가 등록</p>
      </div>
      <Modal>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="w-3/4 text-center text-[14px]/[24px] font-medium">
            '알바 솔로몬 1호점'을 내 매장에서 삭제할까요?
          </p>
          <div className="w-full flex flex-row items-center gap-2 mt-3">
            <div className="flex-1">
              <WhiteBtn>아니오</WhiteBtn>
            </div>
            <div className="flex-1">
              <GreenBtn>예</GreenBtn>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ManageStore;
