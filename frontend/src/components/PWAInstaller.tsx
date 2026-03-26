"use client";
import { useEffect } from "react";

export function PWAInstaller() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (reg) => {
            console.log("Service Worker successfully registered.");
          },
          (err) => {
             console.error("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);
  return null;
}
