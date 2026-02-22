import logo from "../../assets/images/logo-white.svg";

function Splash() {
  return (
    <div className="bg-linear-to-b from-[#004DFF] to-[#001E66] min-h-screen w-full flex items-center justify-center">
      <img src={logo} alt="Logo" className="w-[300px] h-[300px]" />
    </div>
  );
}

export default Splash;
