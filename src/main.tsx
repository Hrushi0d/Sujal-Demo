import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LLMConfigProvider } from "@/lib/llm";
import { ThemeProvider } from "@/lib/theme";
import "@openuidev/react-ui/components.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LLMConfigProvider>
        <App />
      </LLMConfigProvider>
    </ThemeProvider>
  </React.StrictMode>
);
