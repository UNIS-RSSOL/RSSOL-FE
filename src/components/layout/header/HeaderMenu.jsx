import { useState } from "react";
import React from "react";
import SplashImage from "../../assets/Splash.svg";

function HeaderMenu({ MenuIcon, onClick }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <button
        className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer hover:opacity-80 transition"
        onClick={onClick}
      >
        <MenuIcon />
      </button>
    </div>
  );
}