import { useEffect, useState } from "react";
import { api } from "../api";

const toLocal = (iso) => { const d = new Date(iso); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };

// Generic Create / Update / Enable-Disable screen used for Services, Plans, Events, Feedback
function Manager({ path, fields }) {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({});
  const load = () => api(`/api/admin/${path}`).then(setRows);
  useEffect(() => { setF({}); load(); }, [path]);

  const save = async (e) => {
    e.preventDefault();
    const body = { ...f };
    fields.forEach((x) => {
      if (x.type === "number") body[x.k] = +body[x.k] || 0;
      if (x.type === "datetime-local" && body[x.k]) body[x.k] = new Date(body[x.k]).toISOString();
    });
    await api(`/api/admin/${path}${f.id ? "/" + f.id : ""}`, { method: f.id ? "PUT" : "POST", body });
    setF({}); load();
  };
  const edit = (r) => { const c = { ...r }; fields.forEach((x) => { if (x.type === "datetime-local") c[x.k] = toLocal(r[x.k]); }); setF(c); window.scrollTo(0, 0); };
  const toggle = async (r) => { await api(`/api/admin/${path}/${r.id}/toggle`, { method: "PATCH" }); load(); };

  return (<>
    <form className="card" onSubmit={save}>
      <h3>{f.id ? "Update" : "Add new"}</h3>
      {fields.map((x) => (
        <div key={x.k}><label>{x.label}</label>
          {x.type === "textarea"
            ? <textarea rows="3" value={f[x.k] ?? ""} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} />
            : x.type === "checkbox"
              ? <input type="checkbox" style={{ width: "auto", transform: "scale(1.5)", margin: ".6rem" }} checked={!!f[x.k]} onChange={(e) => setF({ ...f, [x.k]: e.target.checked })} />
              : <input type={x.type || "text"} value={f[x.k] ?? ""} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} />}
        </div>
      ))}
      <button>{f.id ? "Save changes" : "Create"}</button>{" "}
      {f.id && <button type="button" className="ghost" onClick={() => setF({})}>Cancel</button>}
    </form>
    <div className="card" style={{ marginTop: "1rem", overflowX: "auto" }}>
      <table><tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td><b>{r[fields[0].k]}</b><div className="muted">{String(r[fields[1].k]).slice(0, 80)}</div></td>
            <td><span className="badge">{r.isActive ? "Enabled" : "Disabled"}</span></td>
            <td style={{ whiteSpace: "nowrap" }}>
              <button className="ghost" onClick={() => edit(r)}>Edit</button>{" "}
              <button className={r.isActive ? "off" : ""} onClick={() => toggle(r)}>{r.isActive ? "Disable" : "Enable"}</button>
            </td>
          </tr>
        ))}
      </tbody></table>
    </div>
  </>);
}

function Staff() {
  const [nutri, setNutri] = useState([]); const [cust, setCust] = useState([]);
  const [f, setF] = useState({ fullName: "", email: "", phone: "", specialization: "", password: "" });
  const [msg, setMsg] = useState("");
  const load = () => { api("/api/admin/users/Nutritionist").then(setNutri); api("/api/admin/users/Customer").then(setCust); };
  useEffect(load, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault(); setMsg("");
    try { await api("/api/admin/nutritionists", { method: "POST", body: f }); setF({ fullName: "", email: "", phone: "", specialization: "", password: "" }); load(); }
    catch (x) { setMsg(x.message); }
  };
  const toggle = async (id) => { await api(`/api/admin/users/${id}/toggle`, { method: "PATCH" }); load(); };
  const assign = async (cid, nid) => { if (nid) { await api(`/api/admin/customers/${cid}/assign/${nid}`, { method: "PUT" }); load(); } };

  return (<>
    <form className="card" onSubmit={add}>
      <h3>On-board new nutritionist</h3>
      {[["fullName", "Full name"], ["email", "Email"], ["phone", "Phone"], ["specialization", "Specialization"], ["password", "Temporary password"]].map(([k, l]) => (
        <div key={k}><label>{l}</label><input required={k !== "phone"} type={k === "password" ? "password" : "text"} value={f[k]} onChange={set(k)} /></div>
      ))}
      {msg && <p style={{ color: "#f87171" }}>{msg}</p>}
      <button>Create nutritionist</button>
    </form>
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Nutritionists</h3>
      <table><tbody>{nutri.map((n) => (
        <tr key={n.id}><td><b>{n.fullName}</b><div className="muted">{n.email} · {n.specialization}</div></td>
          <td><button className={n.isActive ? "off" : ""} onClick={() => toggle(n.id)}>{n.isActive ? "Disable" : "Enable"}</button></td></tr>))}
      </tbody></table>
    </div>
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Customers: assign a nutritionist</h3>
      <table><tbody>{cust.map((c) => (
        <tr key={c.id}><td><b>{c.fullName}</b><div className="muted">{c.email}</div></td>
          <td><select value={c.nutritionistId || ""} onChange={(e) => assign(c.id, e.target.value)}>
            <option value="">-- not assigned --</option>
            {nutri.filter((n) => n.isActive).map((n) => <option key={n.id} value={n.id}>{n.fullName}</option>)}
          </select></td></tr>))}
      </tbody></table>
    </div>
  </>);
}

function Tickets() {
  const [t, setT] = useState([]);
  const load = () => api("/api/admin/tickets").then(setT);
  useEffect(() => { load(); }, []);
  return <div className="card"><h3>Customer care tickets</h3><table><tbody>{t.map((x) => (
    <tr key={x.id}><td><b>{x.subject}</b><div className="muted">{x.body}</div></td><td><span className="badge">{x.status}</span></td>
      <td>{x.status === "Open" && <button onClick={async () => { await api(`/api/admin/tickets/${x.id}/close`, { method: "PATCH" }); load(); }}>Close</button>}</td></tr>))}
  </tbody></table></div>;
}

function Leads() {
  const [t, setT] = useState([]);
  const load = () => api("/api/admin/leads").then(setT);
  useEffect(() => { load(); }, []);
  return <div className="card" style={{ overflowX: "auto" }}><h3>Consultation requests</h3><table><tbody>{t.map((x) => (
    <tr key={x.id}><td><b>{x.name}</b><div className="muted">📞 <a href={`tel:${x.phone}`}>{x.phone}</a> · {x.goal}</div><div className="muted">{x.notes}</div></td>
      <td><span className="badge">{x.status}</span></td>
      <td>{x.status === "New" && <button onClick={async () => { await api(`/api/admin/leads/${x.id}/done`, { method: "PATCH" }); load(); }}>Mark contacted</button>}</td></tr>))}
  </tbody></table>{!t.length && <p className="muted">No requests yet.</p>}</div>;
}

const TABS = {
  Services: <Manager path="services" fields={[{ k: "name", label: "Name" }, { k: "description", label: "Description", type: "textarea" }, { k: "icon", label: "Icon (emoji)" }]} />,
  Plans: <Manager path="plans" fields={[{ k: "name", label: "Name" }, { k: "description", label: "Description", type: "textarea" }, { k: "price", label: "Price (₹)", type: "number" }, { k: "durationDays", label: "Duration (days)", type: "number" }, { k: "features", label: "Features (comma separated)" }, { k: "isPopular", label: "Mark as most popular", type: "checkbox" }]} />,
  Events: <Manager path="events" fields={[{ k: "title", label: "Title" }, { k: "description", label: "Description", type: "textarea" }, { k: "eventDate", label: "Date & time", type: "datetime-local" }, { k: "location", label: "Location" }]} />,
  Feedback: <Manager path="feedback" fields={[{ k: "customerName", label: "Customer" }, { k: "comment", label: "Comment", type: "textarea" }, { k: "rating", label: "Rating (1-5)", type: "number" }]} />,
  Team: <Staff />,
  Leads: <Leads />,
  Tickets: <Tickets />,
};

export default function Admin() {
  const [tab, setTab] = useState("Services");
  return (
    <div className="wrap">
      <h2>Admin Panel</h2>
      <div className="tabs">{Object.keys(TABS).map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div key={tab}>{TABS[tab]}</div>
    </div>
  );
}
