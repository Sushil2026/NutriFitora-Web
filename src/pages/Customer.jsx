import { useEffect, useState } from "react";
import { api } from "../api";
import Chat from "./Chat";

const today = () => new Date().toISOString().slice(0, 10);

function Tracker() {
  const [f, setF] = useState({ logDate: today(), meals: "", calories: 0, waterMl: 0, weightKg: 0, notes: "" });
  const [logs, setLogs] = useState([]); const [ok, setOk] = useState(false);
  const load = () => api("/api/me/logs").then(setLogs);
  useEffect(() => { load(); }, []);
  const n = (k) => (e) => setF({ ...f, [k]: +e.target.value });
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => { e.preventDefault(); await api("/api/me/logs", { method: "POST", body: f }); setOk(true); setTimeout(() => setOk(false), 2000); load(); };
  return (<>
    <form className="card" onSubmit={save}>
      <h3>Today's tracking</h3>
      <label>Date</label><input type="date" value={f.logDate} onChange={s("logDate")} />
      <label>What did you eat?</label><textarea rows="3" value={f.meals} onChange={s("meals")} />
      <div className="grid">
        <div><label>Calories</label><input type="number" value={f.calories} onChange={n("calories")} /></div>
        <div><label>Water (ml)</label><input type="number" value={f.waterMl} onChange={n("waterMl")} /></div>
        <div><label>Weight (kg)</label><input type="number" step="0.1" value={f.weightKg} onChange={n("weightKg")} /></div>
      </div>
      <label>Notes</label><input value={f.notes} onChange={s("notes")} />
      <button>Save</button> {ok && <span style={{ color: "var(--brand)" }}>✔ Saved</span>}
    </form>
    <div className="card" style={{ marginTop: "1rem", overflowX: "auto" }}><h3>History</h3>
      <table><thead><tr><th>Date</th><th>Cal</th><th>Water</th><th>Weight</th></tr></thead>
        <tbody>{logs.map((l) => <tr key={l.id}><td>{l.logDate}</td><td>{l.calories}</td><td>{l.waterMl}</td><td>{l.weightKg}</td></tr>)}</tbody></table></div>
  </>);
}

function Advice() {
  const [d, setD] = useState([]);
  useEffect(() => { api("/api/me/diet").then(setD); }, []);
  return <div>{d.map((x) => <div className="card" key={x.id} style={{ marginBottom: "1rem" }}><h3>{x.title}</h3>
    <div className="muted">{new Date(x.createdAt).toLocaleDateString()}</div><div style={{ whiteSpace: "pre-wrap", fontSize: "1.1rem" }}>{x.details}</div></div>)}
    {!d.length && <div className="card muted">Your dietitian hasn't shared a plan yet.</div>}</div>;
}

function Dietitian({ p }) {
  if (!p?.nutritionist) return <div className="card muted">A nutritionist will be assigned to you shortly.</div>;
  const n = p.nutritionist;
  return (<div className="card"><h3>{n.fullName}</h3>
    <p>📞 <a href={`tel:${n.phone}`}>{n.phone}</a> · ✉️ <a href={`mailto:${n.email}`}>{n.email}</a></p>
    <Chat otherId={n.id} /></div>);
}

function Care() {
  const [f, setF] = useState({ subject: "", body: "" }); const [t, setT] = useState([]);
  const load = () => api("/api/me/tickets").then(setT);
  useEffect(() => { load(); }, []);
  const send = async (e) => { e.preventDefault(); await api("/api/me/tickets", { method: "POST", body: f }); setF({ subject: "", body: "" }); load(); };
  return (<>
    <form className="card" onSubmit={send}><h3>Contact customer care</h3>
      <label>Subject</label><input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
      <label>How can we help?</label><textarea required rows="4" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      <button>Submit request</button></form>
    <div className="card" style={{ marginTop: "1rem" }}><h3>My requests</h3>
      {t.map((x) => <div key={x.id}><b>{x.subject}</b> <span className="badge">{x.status}</span></div>)}</div>
  </>);
}

function Review() {
  const [f, setF] = useState({ rating: 5, comment: "" }); const [ok, setOk] = useState(false);
  const send = async (e) => { e.preventDefault(); await api("/api/me/feedback", { method: "POST", body: f }); setOk(true); setF({ rating: 5, comment: "" }); };
  return <form className="card" onSubmit={send}><h3>Share your feedback</h3>
    <label>Rating</label><select value={f.rating} onChange={(e) => setF({ ...f, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((r) => <option key={r}>{r}</option>)}</select>
    <label>Comment</label><textarea required rows="4" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
    <button>Submit</button> {ok && <span>Thank you! It will appear after review.</span>}</form>;
}

export default function Customer() {
  const [tab, setTab] = useState("Daily Tracking"); const [p, setP] = useState(null);
  useEffect(() => { api("/api/me/profile").then(setP); }, []);
  const tabs = { "Daily Tracking": <Tracker />, "My Diet Advice": <Advice />, "My Dietitian": <Dietitian p={p} />, "Customer Care": <Care />, Feedback: <Review /> };
  return (
    <div className="wrap">
      <h2>Hi {p?.fullName} 🌿</h2>
      {p?.plan && <span className="badge">Plan: {p.plan}</span>}
      <div className="tabs">{Object.keys(tabs).map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tabs[tab]}
    </div>
  );
}
