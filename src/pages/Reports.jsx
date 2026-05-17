import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../cloudinary";

export default function Reports() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Ultrasound");
  const [file, setFile] = useState(null);

  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);

  const reportTypes = ["Ultrasound", "Blood Test", "Prescription", "Other"];

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const refCol = collection(db, "users", auth.currentUser.uid, "reports");
    const q = query(refCol, orderBy("uploadDate", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setReports(data);
    });

    return () => unsub();
  }, [navigate]);

  const uploadToCloudinary = async (selectedFile) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `pregnancy_reports/${auth.currentUser.uid}`);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    return data.secure_url;
  };

  const uploadReport = async () => {
    if (!title || !file) {
      alert("Please enter title and select a file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max allowed size is 5MB.");
      return;
    }

    setUploading(true);

    try {
      const fileUrl = await uploadToCloudinary(file);

      const refCol = collection(db, "users", auth.currentUser.uid, "reports");

      await addDoc(refCol, {
        title,
        type,
        fileName: file.name,
        fileUrl,
        uploadDate: new Date().toISOString(),
      });

      setTitle("");
      setFile(null);

      alert("Report uploaded successfully");
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm("Delete this report?")) return;

    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "reports", reportId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "520px" }}>
      <h4>Reports Upload</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-3 shadow-sm mb-4">
        <label className="form-label fw-bold">Report Title</label>
        <input
          className="form-control mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: 20 Week Scan"
        />

        <label className="form-label fw-bold">Report Type</label>
        <select
          className="form-select mb-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {reportTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="form-label fw-bold">Upload File (PDF/Image)</label>
        <input
          type="file"
          className="form-control mb-3"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="btn btn-primary w-100"
          disabled={uploading}
          onClick={uploadReport}
        >
          {uploading ? "Uploading..." : "Upload Report"}
        </button>
      </div>

      <h5>Uploaded Reports</h5>

      {reports.length === 0 && (
        <p className="text-muted">No reports uploaded yet.</p>
      )}

      {reports.map((r) => (
        <div className="card p-3 mb-2 shadow-sm" key={r.id}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <b>{r.title}</b>
              <div className="text-muted small">{r.type}</div>
              <div className="text-muted small">
                {new Date(r.uploadDate).toLocaleString("en-IN")}
              </div>
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteReport(r.id)}
            >
              Delete
            </button>
          </div>

          <div className="mt-2">
            <a
              className="btn btn-sm btn-success w-100"
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              View / Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}