import { collection, getDocs } from "firebase/firestore";

const COLLECTIONS = [
  "appointments",
  "contractions",
  "dailyChecklist",
  "kickSessions",
  "medicines",
  "reports",
  "symptoms",
  "water",
  "weightLogs",
];

export async function exportUserData(db, uid, profile = null) {
  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    profile,
    data: {},
  };

  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, "users", uid, name));
    payload.data[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return payload;
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
