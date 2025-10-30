import { Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";
import Header from "./components/layout/header/Header.jsx";
import Footer from "./components/layout/footer/Footer.jsx";
import OwnerPage from "./pages/owner/mypage/OwnerPage.jsx";

function App() {
  return (
    <div className="w-full min-[393px]:w-[393px] mx-auto h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/ownerpage" element={<OwnerPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
