const BASE = import.meta.env.VITE_API || "http://localhost:5000";

export async function api(path, { method = "GET", body } = {}) {
  const t = localStorage.getItem("token");
  const r = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(t && { Authorization: "Bearer " + t }) },
    body: body && JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}
