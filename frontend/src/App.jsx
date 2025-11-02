import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import BusinessPage from "./pages/BusinessPage";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessProfile from "./pages/BusinessProfile";
import BusinessDirectory from "./pages/BusinessDirectory";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";

function Layout({ children }) {
  return (
    <div>
      {/* Simple top bar */}
      <nav className="flex justify-between items-center bg-white shadow px-6 py-3">
        <Link to="/" className="text-xl font-semibold text-gray-800">
          AiVault
        </Link>
        <LogoutButton />
      </nav>
      <main>{children}</main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist.</p>
      <a href="/" className="btn btn-primary">
        Back to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/business-access" element={<BusinessPage />} />
          <Route path="/directory" element={<BusinessDirectory />} />
          <Route path="/business/:id" element={<BusinessProfile />} />

          {/* Protected dashboard route */}
          <Route
            path="/dashboard/:id"
            element={
              <ProtectedRoute>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
