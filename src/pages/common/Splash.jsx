import logo from "../../assets/images/logo-white.svg";

function Splash() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#004DFF] to-[#001E66] flex items-center justify-center z-50">
      <img src={logo} alt="Logo" className="w-[200px] h-[200px]" />
    </div>
  );
}

export default Splash;
