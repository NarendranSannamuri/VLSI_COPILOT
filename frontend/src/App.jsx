import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RtlWorkspaceProvider } from "./context/RtlWorkspaceContext";
import Home from "./pages/Home";
import Workspace from "./pages/Workspace";

function App() {
  return (
    <RtlWorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />
          <Route path="/analyze" element={<Navigate to="/workspace" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RtlWorkspaceProvider>
  );
}

export default App;
