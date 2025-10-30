import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="w-full min-[393px]:w-[393px] mx-auto bg-white h-screen flex flex-col">
      <header className="p-4 bg-blue-500 text-white text-center font-bold">
        Header
      </header>

      <Routes className="flex-1 overflow-y-auto"></Routes>
    </div>
  );
}

export default App;
