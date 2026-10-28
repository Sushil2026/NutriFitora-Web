import { useEffect, useState } from "react";
import { api } from "../api";
import Chat from "./Chat";

export default function Nutri() {
  const [clients, setClients] = useState([]); const [sel, setSel] = useState(null);
  const [logs, setLogs] = useState([]); const [diets, setDiets] = useState([]);
  const [f, setF] = useState({ title: "", details: "" });
  useEffect(() => { api("/api/nutri/clients").then(setClients); }, []);

  const open = async (c) => {
    setSel(c);
    setLogs(await api(`/api/nutri/clients/${c.id}/logs`));
    setDiets(await api(`/api/nutri/clients/${c.id}/diet`));
  };
  const suggest = async (e) => {
    e.preventDefault();
    await api(`/api/nutri/clients/${sel.id}/diet`, { method: "POST", body: f });
    setF({ title: "", details: "" }); setDiets(await api(`/api/nutri/clients/${sel.id}/diet`));
  };

  return (
    <div className="wrap">
      <h2>Hello, {localStorage.getItem("name")} 👋</h2>
      <div className="grid" style={{ gridTemplateColumns: "280px 1fr", alignItems: "start" }}>
        <div className="card">
          <h3>My clients ({clients.length})</h3>
          {clients.map((c) => (
            <button key={c.id} className={sel?.id === c.id ? "" : "ghost"} style={{ width: "100%", marginBottom: ".5rem", textAlign: "left" }} onClick={() => open(c)}>{c.fullName}</button>
          ))}
          {!clients.length && <p className="muted">No clients assigned yet.</p>}
        </div>
        {sel ? <div>
          <div className="card"><h3>{sel.fullName}</h3><div className="muted">{sel.email} · {sel.phone}</div></div>
          <div className="card" style={{ marginTop: "1rem", overflowX: "auto" }}>
            <h3>Daily tracking (last 14 days)</h3>
            <table><thead><tr><th>Date</th><th>Calories</th><th>Water</th><th>Weight</th><th>Meals</th></tr></thead>
              <tbody>{logs.map((l) => <tr key={l.id}><td>{l.logDate}</td><td>{l.calories}</td><td>{l.waterMl} ml</td><td>{l.weightKg} kg</td><td>{l.meals}</td></tr>)}</tbody></table>
          </div>
          <form className="card" style={{ marginTop: "1rem" }} onSubmit={suggest}>
            <h3>Suggest diet plan</h3>
            <label>Title</label><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <label>Plan details</label><textarea required rows="6" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} placeholder={"Breakfast: …\nLunch: …\nDinner: …"} />
            <button>Send to client</button>
          </form>
          <div className="card" style={{ marginTop: "1rem" }}><h3>Previous plans</h3>
            {diets.map((d) => <div key={d.id} style={{ marginBottom: "1rem" }}><b>{d.title}</b> <span className="muted">{new Date(d.createdAt).toLocaleDateString()}</span><div style={{ whiteSpace: "pre-wrap" }}>{d.details}</div></div>)}
          </div>
          <div className="card" style={{ marginTop: "1rem" }}><h3>Chat with {sel.fullName}</h3><Chat otherId={sel.id} /></div>
        </div> : <div className="card muted">Select a client to view progress.</div>}
      </div>
    </div>
  );
}
