import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function toDateLabel(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function Insights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [contractions, setContractions] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const uid = auth.currentUser.uid;

        const [profileSnap, weightSnap, symptomSnap, contractionSnap] = await Promise.all([
          getDoc(doc(db, "users", uid)),
          getDocs(query(collection(db, "users", uid, "weightLogs"), orderBy("date", "asc"))),
          getDocs(query(collection(db, "users", uid, "symptoms"), orderBy("date", "asc"))),
          getDocs(query(collection(db, "users", uid, "contractions"), orderBy("startTime", "asc"))),
        ]);

        if (profileSnap.exists()) setProfile(profileSnap.data());

        setWeightLogs(weightSnap.docs.map((d) => d.data()));
        setSymptomLogs(symptomSnap.docs.map((d) => d.data()));
        setContractions(contractionSnap.docs.map((d) => d.data()));
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const weightData = useMemo(
    () => ({
      labels: weightLogs.map((log) => toDateLabel(log.date)),
      datasets: [
        {
          label: "Weight (kg)",
          data: weightLogs.map((log) => Number(log.weight)),
          borderColor: "#1f8f7c",
          backgroundColor: "rgba(31, 143, 124, 0.2)",
          tension: 0.3,
        },
      ],
    }),
    [weightLogs]
  );

  const symptomData = useMemo(
    () => ({
      labels: symptomLogs.map((log) => toDateLabel(log.date)),
      datasets: [
        {
          label: "Symptom Severity",
          data: symptomLogs.map((log) => Number(log.severity || 0)),
          borderColor: "#d18b2f",
          backgroundColor: "rgba(209, 139, 47, 0.2)",
          tension: 0.3,
        },
      ],
    }),
    [symptomLogs]
  );

  const contractionData = useMemo(
    () => ({
      labels: contractions.map((c) => toDateLabel(c.startTime)),
      datasets: [
        {
          label: "Contraction Duration (sec)",
          data: contractions.map((c) => Number(c.durationSeconds || 0)),
          borderColor: "#d64545",
          backgroundColor: "rgba(214, 69, 69, 0.2)",
          tension: 0.3,
        },
      ],
    }),
    [contractions]
  );

  const generatePersonalSummary = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Pregnancy Personal Summary", 14, 16);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 24);

    if (profile) {
      doc.text(`Patient: ${profile.name || "N/A"}`, 14, 31);
      doc.text(`Due Date: ${profile.dueDate ? new Date(profile.dueDate).toLocaleDateString("en-IN") : "N/A"}`, 14, 37);
    }

    autoTable(doc, {
      startY: 44,
      head: [["Metric", "Value"]],
      body: [
        ["Weight entries", String(weightLogs.length)],
        ["Latest weight", weightLogs.length ? `${weightLogs[weightLogs.length - 1].weight} kg` : "N/A"],
        ["Avg symptom severity", average(symptomLogs.map((s) => Number(s.severity || 0))).toFixed(1)],
        ["Contraction records", String(contractions.length)],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Recent symptoms", "Severity", "Date"]],
      body: symptomLogs.slice(-8).reverse().map((s) => [s.symptomType || "N/A", String(s.severity || "-"), s.date || "-"]),
    });

    doc.save(`pregnancy-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="container page-wrap text-center mt-5">
        <h5>Loading insights...</h5>
      </div>
    );
  }

  return (
    <div className="container page-wrap" style={{ maxWidth: "700px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">My Insights & Summary</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      <button className="btn btn-primary w-100 mb-3" onClick={generatePersonalSummary}>
        Download My Summary PDF
      </button>

      <div className="card p-3 mb-3">
        <h6 className="fw-bold">Weight Trend</h6>
        {weightLogs.length ? <Line data={weightData} /> : <div className="text-muted small">No weight data yet.</div>}
      </div>

      <div className="card p-3 mb-3">
        <h6 className="fw-bold">Symptom Severity Trend</h6>
        {symptomLogs.length ? <Line data={symptomData} /> : <div className="text-muted small">No symptom data yet.</div>}
      </div>

      <div className="card p-3 mb-5">
        <h6 className="fw-bold">Contraction Duration Trend</h6>
        {contractions.length ? (
          <Line data={contractionData} />
        ) : (
          <div className="text-muted small">No contraction records yet.</div>
        )}
      </div>
    </div>
  );
}
