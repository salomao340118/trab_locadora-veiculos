import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/theme.css";
import App from "./App";

// createRoot inicializa o React no elemento HTML com id="root".
// StrictMode ajuda a detectar efeitos colaterais durante o desenvolvimento.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);