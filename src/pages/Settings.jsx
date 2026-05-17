import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const navigate = useNavigate();

    const logout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div className="container mt-3" style={{ maxWidth: "520px" }}>
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
                <p className="text-muted small mb-0">
                    Hindi/English switch will be added here later.
                </p>
            </div>

            <div className="card p-3 shadow-sm mt-3">
                <b>App Info</b>
                <p className="text-muted small mb-0">
                    Pregnancy Tracker App (Beta)
                </p>
            </div>

            <button
                className="btn btn-primary w-100 mt-3"
                onClick={() => navigate("/reminders")}
            >
                Reminders 🔔
            </button>
        </div>
    );
}