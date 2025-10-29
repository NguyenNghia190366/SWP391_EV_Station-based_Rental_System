import { Outlet } from "react-router-dom";
import Header from "../../Header&Footer/Header";
import Footer from "../../Header&Footer/Footer";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
