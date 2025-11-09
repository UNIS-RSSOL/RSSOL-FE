import React from "react";
import { useState, useEffect, Children } from "react";
import PencilIcon from "../../../assets/icons/PencilIcon";

function InfoBox({ title, children }) {
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    console.log(isEdit);
  }, [isEdit]);

  const childrenWithIsEdit = Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isEdit: isEdit });
    }
    return child;
  });

  return (
    <div className="w-full p-4">
      <div className="flex flex-row justify-between mb-4">
        <p className="font-medium text-base text-left">{title}</p>
        {isEdit ? (
          <div
            className="w-[68px] h-[25px] rounded-[20px] border-[1px] border-[#68E194] text-[14px]/6 font-[400] cursor-pointer"
            onClick={() => setIsEdit(false)}
          >
            수정완료
          </div>
        ) : (
          <PencilIcon onClick={() => setIsEdit(true)} isFilled={true} />
        )}
      </div>
      <div>{childrenWithIsEdit}</div>
    </div>
  );
}

export default InfoBox;
