import DeleteIcon from "../../assets/newicons/DeleteIcon";

function StoreItem({ index, store, onClick }) {
  return (
    <div className="flex flex-col w-full items-start justify-center">
      <p className="text-[14px] font-[600] text-left">등록 매장 {index}</p>
      <div className="flex flex-row w-full justify-between items-center border-b border-[#87888c] py-2">
        <p className="text-[18px] font-[600] text-left">{store.name}</p>
        <DeleteIcon className="cursor-pointer" onClick={onClick} />
      </div>
    </div>
  );
}

export default StoreItem;
