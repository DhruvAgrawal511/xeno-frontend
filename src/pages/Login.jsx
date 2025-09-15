// src/pages/Login.jsx
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Login() {
  const { loginWithIdToken } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        try {
          if (!resp?.credential) return;
          // 👇 Use the AuthProvider helper, not manual fetch
          await loginWithIdToken(resp.credential);
        } catch (e) {
          console.error("Login failed:", e);
          alert("Login failed: " + (e.message || e));
        }
      }
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large", shape: "pill", text: "signin_with" }
    );
  }, [clientId, loginWithIdToken]);

  return (
    <div className="container">
      <div
        className="card"
        style={{ maxWidth: 420, margin: "60px auto", textAlign: "center" }}
      >
        <h2>Sign in to Xeno Mini CRM</h2>
        <p>
          <small className="muted">Use your Google account</small>
        </p>
        <div id="googleBtn" style={{ display: "inline-block" }}></div>
      </div>
    </div>
  );
}
