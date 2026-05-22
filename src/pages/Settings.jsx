import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../components/ThemeProvider";
import { doc, getDoc } from "firebase/firestore";
import { downloadJson, exportUserData } from "../utils/exportData";
import { useState } from "react";

export default function Settings() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [exporting, setExporting] = useState(false);

    const logout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const exportData = async () => {
        if (!auth.currentUser) return;

        try {
            setExporting(true);
            const profileSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
            const payload = await exportUserData(
                db,
                auth.currentUser.uid,
                profileSnap.exists() ? profileSnap.data() : null
            );
            downloadJson(`pregnancy-tracker-export-${new Date().toISOString().slice(0, 10)}.json`, payload);
        } catch (error) {
            alert(error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="container page-wrap" style={{ maxWidth: "560px" }}>
            <h4>Settings ⚙️</h4>

            <div className="card p-3 shadow-sm mt-3">
                <b>Account</b>
                <p className="text-muted small mb-2">{auth.currentUser?.email}</p>

                <button className="btn btn-danger w-100" onClick={logout}>
                    Logout
                </button>
            </div>

            <div className="card p-3 shadow-sm mt-3">
                <b>Language</b>
                <select
                    className="form-select mt-2"
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                </select>
            </div>

            <div className="card p-3 shadow-sm mt-3">
                <b>Appearance</b>
                <div className="small text-muted mt-1">Current mode: {resolvedTheme}</div>
                <select className="form-select mt-2" value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            <button
                className="btn btn-primary w-100 mt-3"
                onClick={() => navigate("/reminders")}
            >
                Reminders 🔔
            </button>

            <button className="btn btn-outline-danger w-100 mt-2" onClick={() => navigate("/emergency")}>
                Emergency Contacts 🚨
            </button>

            <button className="btn btn-outline-primary w-100 mt-2" onClick={exportData} disabled={exporting}>
                {exporting ? "Preparing Export..." : "Export My Data"}
            </button>
        </div>
    );
}