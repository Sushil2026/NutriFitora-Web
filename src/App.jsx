import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Public from "./pages/Public";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Nutri from "./pages/Nutri";
import Customer from "./pages/Customer";
import logoImg from "./assets/logo.png";
import { Moon, Sun } from "lucide-react";

// Replace this SVG with your company logo (or use <img src={logoUrl} />)
export const Logo = () => (
  <Link to="/" className="logo">
    <img src={logoImg} alt="Nutri Fitora" style={{ height: 84 }} />
    Nutri Fitora
  </Link>
);

const home = { Admin: "/admin", Nutritionist: "/nutri", Customer: "/me" };

function Guard({ role, children }) {
  return localStorage.getItem("role") === role ? children : <Navigate to="/login" />;
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const nav = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = () => { localStorage.clear(); localStorage.setItem("theme", theme); nav("/"); };

const Icon = theme === "dark" ? Sun : Moon;
  return (
    <>
      <header className="top">
        <Logo />
        <nav>
          {!role && <>
            <a className="nl" href="/#services">Services</a>
            <a className="nl" href="/#plans">Plans</a>
            <a className="nl" href="/#stories">Happy customers</a>
          </>}

<Icon
  size={20}
  className="cursor-pointer"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
/>          
          {role ? (<>
            <Link className="btn ghost" to={home[role]}>My Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>) : <><Link className="btn ghost" to="/login">Log in</Link><a className="btn" href="/#consult">Free consultation</a></>}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Public />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Guard role="Admin"><Admin /></Guard>} />
        <Route path="/nutri" element={<Guard role="Nutritionist"><Nutri /></Guard>} />
        <Route path="/me" element={<Guard role="Customer"><Customer /></Guard>} />
      </Routes>
    </>
  );
}
