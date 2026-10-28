import { useEffect, useState } from "react";
import { api } from "../api";

const steps = [
  ["1", "Book a free consultation", "Tell us your goal and lifestyle. We call you and suggest a plan."],
  ["2", "Get your personal plan", "Your nutritionist builds a diet plan and sets your target."],
  ["3", "Check in daily", "Log weight and water in under a minute. Your nutritionist adjusts the plan."],
];
const goals = ["Weight loss", "Muscle gain", "Diabetes care", "PCOS & hormones", "General wellness"];

function Chart() {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Your progress, in one picture</h3>
      <svg viewBox="0 0 360 200" width="100%" role="img" aria-label="Sample weight progress chart">
        {[40, 80, 120, 160].map((y) => <line key={y} x1="10" x2="350" y1={y} y2={y} stroke="var(--border)" />)}
        <path d="M10 40 L70 52 L130 66 L190 84 L250 104 L310 120 L350 132 L350 190 L10 190Z" fill="var(--brand)" opacity=".12" />
        <polyline points="10,40 70,52 130,66 190,84 250,104 310,120 350,132" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="350" cy="132" r="5" fill="var(--brand)" />
      </svg>
      <div className="stat"><span>Weight ↓</span><span>Water 💧</span><span>Streak 🔥</span></div>
      <p className="muted" style={{ marginBottom: 0 }}>Sample chart. Yours updates after every daily check-in.</p>
    </div>
  );
}

function Consult() {
  const [f, setF] = useState({ name: "", phone: "", goal: "", notes: "" });
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setState("sending");
    try { await api("/api/public/consultation", { method: "POST", body: f }); setState("done"); setF({ name: "", phone: "", goal: "", notes: "" }); }
    catch { setState("error"); }
  };
  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 560 }}>
      <label>Your name</label><input required value={f.name} onChange={set("name")} />
      <label>Phone number</label><input required type="tel" value={f.phone} onChange={set("phone")} />
      <label>Your goal</label>
      <select value={f.goal} onChange={set("goal")}><option value="">Choose a goal</option>{goals.map((g) => <option key={g}>{g}</option>)}</select>
      <label>Anything we should know? (optional)</label><textarea rows="3" value={f.notes} onChange={set("notes")} />
      <button disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Request a call"}</button>
      {state === "done" && <p style={{ color: "var(--brand)" }}>✔ Thank you! We'll call you soon.</p>}
      {state === "error" && <p style={{ color: "#f87171" }}>Something went wrong. Please try again.</p>}
    </form>
  );
}

export default function Public() {
  const [d, setD] = useState({ services: [], plans: [], feedback: [], events: [] });
  useEffect(() => {
    Promise.all(["services", "plans", "feedback", "events"].map((k) => api("/api/public/" + k)))
      .then(([services, plans, feedback, events]) => setD({ services, plans, feedback, events }))
      .catch(console.error);
  }, []);

  return (
    <div className="wrap" id="top">
      <section className="hero2">
        <div>
          <span className="pill">Certified nutritionists</span>
          <h1>Eat smart. Feel strong. Stay consistent.</h1>
          <p className="muted" style={{ fontSize: "1.15rem" }}>A diet plan made for you, a nutritionist who checks your progress, and a daily nudge that keeps you going.</p>
          <div className="row"><a className="btn" href="#consult">Book free consultation</a><a className="btn ghost" href="#plans">See plans</a></div>
        </div>
        <Chart />
      </section>

      <section className="sec" id="services">
        <h2>Services</h2><p className="muted">Whatever your goal, you get a plan, a person and a routine.</p>
        <div className="grid">{d.services.map((s) => (
          <div className="card" key={s.id}><div style={{ fontSize: "2rem" }}>{s.icon}</div><h3>{s.name}</h3><p className="muted">{s.description}</p></div>
        ))}</div>
      </section>

      <section className="sec" id="how">
        <h2>How it works</h2><p className="muted">Three steps from first call to steady progress.</p>
        <div className="grid">{steps.map(([n, t, x]) => (
          <div className="card" key={n}><div className="num">{n}</div><h3>{t}</h3><p className="muted">{x}</p></div>
        ))}</div>
      </section>

      <section className="sec" id="plans">
        <h2>Plans</h2><p className="muted">Pick the programme that matches your goal. Not sure? The consultation is free.</p>
        <div className="grid">{d.plans.map((p) => (
          <div className={"card plan" + (p.isPopular ? " pop" : "")} key={p.id}>
            {p.isPopular && <span className="tag">Most popular</span>}
            <h3>{p.name}</h3><p className="muted">{p.description}</p>
            <div><span className="price">₹{p.price}</span> <span className="muted">/ {p.durationDays} days</span></div>
            <ul>{p.features.split(",").filter(Boolean).map((x, i) => <li key={i}>{x.trim()}</li>)}</ul>
            <a className="btn" href="#consult">Talk to us</a>
          </div>
        ))}</div>
      </section>

      {d.events.length > 0 && (
        <section className="sec" id="events">
          <h2>Upcoming events</h2>
          <div className="grid">{d.events.map((e) => (
            <div className="card" key={e.id}><h3>{e.title}</h3>
              <div className="muted">📅 {new Date(e.eventDate).toLocaleString()} · 📍 {e.location}</div><p>{e.description}</p></div>
          ))}</div>
        </section>
      )}

      <section className="sec" id="stories">
        <h2>Happy customers</h2><p className="muted">Real people, real routines.</p>
        <div className="grid">{d.feedback.map((f) => (
          <div className="card" key={f.id}><div style={{ color: "gold" }}>{"★".repeat(f.rating)}</div><p>“{f.comment}”</p><b>{f.customerName}</b></div>
        ))}</div>
        {!d.feedback.length && <p className="muted">Customer stories will appear here.</p>}
      </section>

      <section className="sec" id="consult">
        <h2>Get your free consultation</h2><p className="muted">Leave your number. We’ll call you to understand your goal.</p>
        <Consult />
      </section>

      <footer className="foot">
        <b>Nutri Fitora</b><div className="muted">Personal nutrition, tracked daily.</div>
        <small className="muted">© Nutri Fitora. Nutrition advice here does not replace medical care.</small>
      </footer>
    </div>
  );
}
