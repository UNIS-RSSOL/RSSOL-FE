import Box from "./Box";

function Note({ children, className, hole }) {
  return (
    <Box
      className={`flex flex-row rounded-none rounded-r-lg py-0 pr-0 ${className}`}
      disabled={true}
    >
      <div className="flex flex-col gap-[18px] mr-2 ">
        {[...Array(hole || 4)].map((_, index) => (
          <div
            key={index}
            className="size-[12px] inset-shadow-[4px_4px_4px_0_rgba(0,0,0,0.15)]"
          ></div>
        ))}
      </div>
      {children}
    </Box>
  );
}

export default Note;
