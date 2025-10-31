import { Outlet } from "react-router-dom";
import Header from "../../Header&Footer/Header";
import Footer from "../../Header&Footer/Footer";

export default function Layout() {
  console.log(1);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
