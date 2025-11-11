import { useState } from "react";
import React from "react";
import HeaderImage from "../../assets/Header.svg";

function Header() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <img src={HeaderImage} alt="Header" />
    </div>
  );
}

export default Header;  
