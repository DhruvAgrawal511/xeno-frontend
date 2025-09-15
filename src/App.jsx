import { Routes, Route } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Customers from "./pages/Customers.jsx";
import Orders from "./pages/Orders.jsx";
import Segments from "./pages/Segments.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";

export default function App(){
  const { user, checking } = useAuth();

  if (checking) return <div className="container"><div className="card"><p>Loading…</p></div></div>;
  if (!user) return <Login/>;

  return (
    <div className="container">
      <NavBar/>
      <div style={{height:16}}/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/customers" element={<Customers/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/segments" element={<Segments/>}/>
        <Route path="/campaigns" element={<Campaigns/>}/>
        <Route path="/history" element={<History/>}/>
      </Routes>
      <footer>© {new Date().getFullYear()} Xeno Mini CRM — demo</footer>
    </div>
  );
}
