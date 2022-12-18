import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: async ({ waiting }) => {
    console.log("UPDATE");
    waiting?.postMessage?.({ type: "SKIP_WAITING" });

    try {
      // console.log("Start clear cache...");
      // console.log("caches.keys...");
      // const names = await window.caches.keys();
      // console.log("caches.delete...");
      // for (let name of names) await window.caches.delete(name);
      // console.log("Finish clear cache");
      console.log("Reload page");
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
