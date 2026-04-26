import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupDailyReminder } from "./lib/dailyReminder";

void setupDailyReminder();

createRoot(document.getElementById("root")!).render(<App />);
