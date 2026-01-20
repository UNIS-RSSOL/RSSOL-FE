import Box from "./Box";

function Note({ children, className, hole = 0 }) {
  return (
    <Box
      className={`rounded-none rounded-r-[20px] !py-0 !pr-0 !px-2 ${className}`}
      disabled={true}
    >
      <div className="flex flex-col gap-[18px] mr-1 my-2 ">
        {[...Array(hole + 2)].map((_, index) => (
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
