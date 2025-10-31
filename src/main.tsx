import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";


async function requestNotificationPermission() {
  const permission = await window.Notification.requestPermission();
  // permission can of: 'granted' | 'denied' |  'default'
  if (permission === 'denied') {
    console.error('User denied Notification Permisssion')
    return false
  } else if (permission === 'granted') {
    console.log('User granted Notification.')
    return true;
  }
  return false;
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const swRegistration = await navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}service_worker.js`)
    // .then((reg) => console.log("Service worker registration succesful", reg))
    // .catch((err) => console.error("Registration failed: ", err));
    //
    if ('PushManager' in window) {
      console.log('Push API is supported.')
      await requestNotificationPermission()
    }

  }
}
await registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
