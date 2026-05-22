import { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });

    return () => unsub();
  }, [navigate]);

  const signup = async () => {
    if (!email || !password) return alert("Enter email and password");

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!email || !password) return alert("Enter email and password");

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!email) return alert("Enter your email first");

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ padding: "20px" }}
    >
      <div
        className="card shadow-lg border-0 p-4 login-card"
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div className="text-center mb-4">
          <div style={{ fontSize: "55px" }}>🤰</div>
          <h3 className="fw-bold mt-2 mb-1">Pregnancy Tracker</h3>
          <p className="text-muted mb-0">
            Your personal pregnancy care and wellness journal.
          </p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Email</label>
          <input
            className="form-control"
            style={{ padding: "12px" }}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Password</label>
          <input
            className="form-control"
            style={{ padding: "12px" }}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="text-end mb-3">
          <button
            className="btn btn-link p-0"
            style={{ fontSize: "14px", textDecoration: "none" }}
            onClick={forgotPassword}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <button
          className="btn btn-primary w-100 py-2 fw-bold"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <button
          className="btn btn-success w-100 py-2 fw-bold mt-2"
          onClick={signup}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Signup"}
        </button>

        <div className="text-center my-3 text-muted fw-bold">OR</div>

        <button
          className="btn btn-outline-dark w-100 py-2 fw-bold"
          onClick={googleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="text-center mt-4">
          <small className="text-muted">
            Beta Version • Personal Pregnancy Tracker
          </small>
        </div>
      </div>
    </div>
  );
}