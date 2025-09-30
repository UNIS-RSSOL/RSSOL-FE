import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  return (
    <div className="max-w-[393px] mx-auto bg-white min-h-screen shadow-md">
      <header className="p-4 bg-blue-500 text-white text-center font-bold">
        모바일 고정 사이트
      </header>

      <main className="p-4">
        <p className="text-gray-700">
          이 사이트는 항상 393px 폭으로만 보입니다.
        </p>
        <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded">
          버튼
        </button>
      </main>
    </div>
  );
}

export default App;
