import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Pregnancy Tracker",
      dashboard: "Dashboard",
      weeklyGuide: "Weekly Guide",
      logout: "Logout",
      trimester: "Trimester",
      dueDate: "Due Date",
      week: "Week",
      day: "Day",
      language: "Language",
      english: "English",
      hindi: "Hindi",
      back: "Back",
    },
  },
  hi: {
    translation: {
      appName: "गर्भावस्था ट्रैकर",
      dashboard: "डैशबोर्ड",
      weeklyGuide: "साप्ताहिक गाइड",
      logout: "लॉगआउट",
      trimester: "त्रैमासिक",
      dueDate: "डिलीवरी डेट",
      week: "सप्ताह",
      day: "दिन",
      language: "भाषा",
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
      back: "वापस",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;