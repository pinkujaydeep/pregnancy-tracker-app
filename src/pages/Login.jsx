import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Pregnancy Tracker</h2>

      <div className="card p-4">
        <input
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100 mb-2" onClick={login}>
          Login
        </button>

        <button className="btn btn-success w-100 mb-2" onClick={signup}>
          Signup
        </button>

        <button className="btn btn-danger w-100" onClick={googleLogin}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}