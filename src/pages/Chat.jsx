import { useEffect, useState } from "react";
import { api } from "../api";

export default function Chat({ otherId }) {
  const [m, setM] = useState([]); const [t, setT] = useState("");
  const load = () => api(`/api/chat/${otherId}`).then(setM).catch(() => {});
  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, [otherId]);
  const send = async (e) => {
    e.preventDefault(); if (!t.trim()) return;
    await api(`/api/chat/${otherId}`, { method: "POST", body: { body: t } }); setT(""); load();
  };
  return (<div>
    <div className="chat">{m.map((x) => <div key={x.id} className={"msg " + (x.fromId === otherId ? "" : "me")}>{x.body}</div>)}</div>
    <form onSubmit={send} style={{ display: "flex", gap: ".5rem" }}>
      <input style={{ margin: 0 }} value={t} onChange={(e) => setT(e.target.value)} placeholder="Type a message…" /><button>Send</button>
    </form>
  </div>);
}
