import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";

const home = { Admin: "/admin", Nutritionist: "/nutri", Customer: "/me" };

export default function Login() {
  const [q] = useSearchParams();
  const [reg, setReg] = useState(q.get("mode") === "register");
  const [f, setF] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try {
      if (reg) await api("/api/auth/register", { method: "POST", body: { ...f, planId: q.get("plan") ? +q.get("plan") : null } });
      const r = await api("/api/auth/login", { method: "POST", body: { email: f.email, password: f.password } });
      localStorage.setItem("token", r.token); localStorage.setItem("role", r.role); localStorage.setItem("name", r.name);
      nav(home[r.role]);
    } catch (x) { setErr(x.message.includes("401") || x.message === "" ? "Invalid email or password" : x.message); }
  };

  return (
    <div className="wrap" style={{ maxWidth: 480 }}>
      <form className="card" onSubmit={submit}>
        <h2>{reg ? "Create your account" : "Welcome back"}</h2>
        {reg && <><label>Full name</label><input required value={f.fullName} onChange={set("fullName")} />
          <label>Phone</label><input value={f.phone} onChange={set("phone")} /></>}
        <label>Email</label><input type="email" required value={f.email} onChange={set("email")} />
        <label>Password</label><input type="password" required value={f.password} onChange={set("password")} />
        {err && <p style={{ color: "#f87171" }}>{err}</p>}
        <button style={{ width: "100%" }}>{reg ? "Sign up" : "Login"}</button>
        <p className="muted" style={{ textAlign: "center" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setReg(!reg); }}>{reg ? "Already have an account? Login" : "New here? Create account"}</a>
        </p>
      </form>
    </div>
  );
}
