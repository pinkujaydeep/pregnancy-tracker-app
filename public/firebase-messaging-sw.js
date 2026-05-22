/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCaEYkQq4ixwaAuUeOuwFok7o9DOrUrpBo",
  authDomain: "pregnancy-tracker-app-2eebb.firebaseapp.com",
  projectId: "pregnancy-tracker-app-2eebb",
  storageBucket: "pregnancy-tracker-app-2eebb.firebasestorage.app",
  messagingSenderId: "374200934963",
  appId: "1:374200934963:web:68767f2d193d3752593946",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Pregnancy Tracker";
  const options = {
    body: payload.notification?.body || "You have a new reminder.",
    icon: "/icon.png",
  };

  self.registration.showNotification(title, options);
});
