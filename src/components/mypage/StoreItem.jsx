import DeleteIcon from "../../assets/icons/DeleteIcon.jsx";

function StoreItem({ index, store, onClick }) {
  return (
    <div className="flex flex-row w-full items-center justify-between py-[16px] border-b border-[#E0E0E0]">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-[400] text-[#87888c]">
          등록 매장 {index}
        </p>
        <p className="text-[16px] font-[600]">
          {store.name || `${index}호점`}
        </p>
      </div>
      <DeleteIcon className="cursor-pointer" onClick={onClick} />
    </div>
  );
}

export default StoreItem;
