import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PencilIcon from "../../../assets/icons/PencilIcon.jsx";
import InfoItem from "./InfoItem.jsx";
import ArrowIcon from "../../../assets/icons/ArrowIcon.jsx";

function InfoBox({ head, myData, onDataUpdate }) {
  const [isEdit, setIsEdit] = useState(false);
  const [tempData, setTempData] = useState([...myData]);
  const navigate = useNavigate();

  useEffect(() => {
    setTempData([...myData]);
  }, [myData]);

  const handleUpdate = (title, newValue, id) => {
    const updatedData = tempData.map((d) => {
      if (d.title === title) {
        if (d.title === "은행 계좌번호") {
          return { ...d, id: id, content: newValue };
        } else {
          return { ...d, content: newValue };
        }
      }
      return d;
    });
    setTempData(updatedData);
  };

  const handleSave = () => {
    onDataUpdate(tempData);
    setIsEdit(false);
  };

  return (
    <div className="flex flex-col p-5 w-full gap-4">
      <div className="flex flex-row justify-between items-center">
        <p className="text-[18px] font-[500]">{head}</p>
        {isEdit ? (
          <p
            className="flex items-center justify-center h-[25px] rounded-full px-[9px] border border-[#68e194] text-[14px] font-[400] bg-[#fefffe] cursor-pointer"
            onClick={handleSave}
          >
            수정완료
          </p>
        ) : (
          <PencilIcon isFilled={true} onClick={() => setIsEdit(true)} />
        )}
      </div>
      <div className="flex flex-col w-full gap-3">
        {tempData.map((d) =>
          d.title === "내 매장 관리" ? (
            <div
              key={d.title}
              className="flex flex-row w-full items-center gap-2"
            >
              <div className="flex flex-shrink-0 items-center justify-center size-[40px]">
                {d.icon}
              </div>
              <div className="flex flex-col w-full items-start gap-2">
                <p className="text-[14px] font-[600] text-[#87888c] text-left">
                  {d.title}
                </p>
                <p className="w-full text-black text-[18px] font-[600] text-left">
                  {d.content}
                </p>
              </div>
              <ArrowIcon
                onClick={() => navigate("/employee/mypage/managestore")}
              />
            </div>
          ) : (
            <InfoItem
              key={d.title}
              data={d}
              isEdit={isEdit}
              onUpdate={handleUpdate}
            />
          ),
        )}
      </div>
    </div>
  );
}

export default InfoBox;
