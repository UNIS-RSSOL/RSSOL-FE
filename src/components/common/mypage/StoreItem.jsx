import DeleteIcon from "../../../assets/icons/DeleteIcon";

function StoreItem({ num, name }) {
  return (
    <div className="flex flex-col items-start my-2">
      <p className="text-[14px] font-semibold pl-3 mb-2">등록 매장{num}</p>
      <div className="flex flex-row w-full justify-between px-2 py-1 border-b border-gray-400">
        <p className="text-[18px] font-semibold">{name}</p>
        <DeleteIcon />
      </div>
    </div>
  );
}

export default StoreItem;
