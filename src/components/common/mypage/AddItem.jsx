function AddItem({ data, index, onChange }) {
  return (
    <div>
      <div className="flex flex-row w-full items-center gap-2">
        <div className="flex flex-shrink-0 items-center justify-center size-[40px]">
          {data.icon}
        </div>
        <div className="flex flex-col w-full items-start gap-2">
          <div className="flex flex-row items-center">
            <p className="text-[14px] font-[600] text-[#87888c] text-left">
              {data.title}
            </p>
            {data.title !== "사업자 등록 번호" && <span>*</span>}
          </div>
          <div className="flex flex-row items-center">
            <p className="text-[18px] font-[600] mr-2">-</p>
            <input
              className="text-black text-[18px] font-[600]"
              value={data.content}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange(index, newValue);
              }}
            />
          </div>
        </div>
      </div>
      <div className="h-[12px] border-b border-[#87888c] ml-11 text-[10px] font-[400] text-[#f74a7a] text-left"></div>
    </div>
  );
}

export default AddItem;
