import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Fade,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("All fields are required");
      return;
    }

    if (phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/auth/register", {
        name,
        email,
        password,
        phone,
      });

      alert("Registration successful! Please complete Face Enrollment.");
      navigate("/face-enroll");

    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Registration failed");
    }

    setLoading(false);
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
      <Fade in timeout={500}>
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 450,
            p: 4,
            borderRadius: 3,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 25px rgba(0, 229, 255, 0.15)",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PersonAddIcon sx={{ color: "#00E5FF", fontSize: 32, mr: 1 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg,#00E5FF,#00FFC3)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Create an Account
            </Typography>
          </Box>

          <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.65)" }}>
            Join our secure fintech platform and start transacting safely.
          </Typography>

          {/* Form */}
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                input: { color: "white" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Mobile Number"
              margin="normal"
              required
              inputProps={{ maxLength: 10 }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{
                input: { color: "white" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                input: { color: "white" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              margin="normal"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                input: { color: "white" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "white" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirm Password"
              margin="normal"
              required
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                input: { color: "white" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      sx={{ color: "white" }}
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.3,
                textTransform: "none",
                fontSize: "1.05rem",
                background: "#00E5FF",
                color: "#000",
                fontWeight: 700,
                "&:hover": { background: "#12F3FF" },
              }}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          {/* Login Redirect */}
          <Typography
            sx={{
              mt: 3,
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Already have an account?{" "}
            <span
              style={{
                color: "#00E5FF",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
