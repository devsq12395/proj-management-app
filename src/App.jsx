import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Login from "./routes/Login.jsx";
import Orgs from "./routes/Orgs.jsx";
import Dashboard from "./routes/Dashboard.jsx";
import ProjInfo from "./routes/ProjInfo.jsx";

function App() {
  const navigate = useNavigate();

  useEffect (() => {
    navigate ("/");
  }, []);

  return <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/orgs" element={<Orgs />} />
    <Route path="/dashboard" element={<Dashboard />} />

    <Route path="/proj-info">
      <Route path=":projID" element={<ProjInfo />} />
    </Route>
  </Routes>
}

export default App;
