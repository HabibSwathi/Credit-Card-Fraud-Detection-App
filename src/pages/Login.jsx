import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Fade,
} from "@mui/material";

export default function Login() {
  const navigate = useNavigate();
  const { setToken, setTempToken, setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data.mfa) {
        setTempToken(res.data.tempToken);
        setUser(res.data.user);
        navigate("/otp-verify");
        return;
      }

      setToken(res.data.token);
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A0F1F, #0D1628)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Fade in timeout={600}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 3,
            borderRadius: 3,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 35px rgba(0, 229, 255, 0.18)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 4,
                background: "linear-gradient(90deg, #00E5FF, #00FFC3)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Welcome Back
            </Typography>

            <form onSubmit={handleLogin}>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  input: { color: "white" },
                  label: { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                }}
              />

              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  input: { color: "white" },
                  label: { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.4,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  textTransform: "none",
                  background: "#00E5FF",
                  color: "#000",
                  borderRadius: 2,
                  "&:hover": { background: "#12F3FF" },
                }}
              >
                {loading ? (
                  <CircularProgress size={26} sx={{ color: "black" }} />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Register Redirect */}
            <Typography
              align="center"
              sx={{ mt: 3, color: "rgba(255,255,255,0.65)" }}
            >
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                style={{
                  color: "#00E5FF",
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Register
              </span>
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}