const criticalSymptoms = new Set([
  "Headache",
  "Dizziness",
  "Swelling",
  "Cramps",
]);

export function evaluateSymptomRisk({ symptomType, severity, notes = "" }) {
  const normalizedSeverity = Number(severity || 0);
  const lowerNotes = notes.toLowerCase();

  const noteDanger =
    lowerNotes.includes("bleeding") ||
    lowerNotes.includes("blur") ||
    lowerNotes.includes("faint") ||
    lowerNotes.includes("no movement") ||
    lowerNotes.includes("chest pain") ||
    lowerNotes.includes("shortness of breath");

  const severeCritical = criticalSymptoms.has(symptomType) && normalizedSeverity >= 8;
  const highRisk = normalizedSeverity >= 9 || noteDanger;
  const moderateRisk = normalizedSeverity >= 7;

  if (highRisk || severeCritical) {
    return {
      level: "high",
      message:
        "High-risk symptom pattern detected. Contact your OB team now or use Emergency support.",
    };
  }

  if (moderateRisk) {
    return {
      level: "moderate",
      message:
        "Moderate symptom severity detected. Monitor closely and consult doctor if this persists.",
    };
  }

  return {
    level: "low",
    message: "Low-risk entry recorded.",
  };
}
