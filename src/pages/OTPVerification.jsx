import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  Fade,
} from "@mui/material";

export default function OTPVerification() {
  const { tempToken, setToken, setTempToken, user, setUser } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const sentRef = useRef(false);

  // -----------------------------------------------------
  // Auto-send OTP when entering this page
  // -----------------------------------------------------
  useEffect(() => {
    if (!tempToken) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    if (sentRef.current) return;
    sentRef.current = true;

    const sendOtp = async () => {
      try {
        await axios.post("/otp/send"); 
      } catch (err) {
        console.error("OTP send error:", err);
        alert("Failed to send OTP");
      }
    };

    sendOtp();
  }, []);

  // -----------------------------------------------------
  // Handle OTP Submit
  // -----------------------------------------------------
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/otp/verify", { otp });

      setToken(res.data.token);
      setTempToken(null);

      const profile = await axios.get("/auth/me");
      setUser(profile.data.user);

      navigate("/face-enroll");
    } catch (err) {
      console.error("OTP verify error:", err);
      alert(err.response?.data?.message || "OTP verification failed");
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
      <Fade in timeout={600}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 3,
            p: 1,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 30px rgba(0, 229, 255, 0.18)",
          }}
        >
          <CardContent sx={{ p: 4 }}>

            {/* Title */}
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: "linear-gradient(90deg, #00E5FF, #00FFC3)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Verify OTP
            </Typography>

            {/* Subtext */}
            <Typography
              align="center"
              sx={{
                color: "rgba(255,255,255,0.68)",
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              OTP sent to  
              <strong style={{ color: "#00E5FF" }}>
                {" "} {user?.phone || "your mobile number"}
              </strong>
            </Typography>

            {/* OTP Input */}
            <form onSubmit={handleVerify}>
              <TextField
                fullWidth
                label="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6, style: { color: "white" } }}
                sx={{
                  mb: 3,
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontSize: "1.05rem",
                  textTransform: "none",
                  background: "#00E5FF",
                  color: "#000",
                  fontWeight: 700,
                  borderRadius: 2,
                  "&:hover": { background: "#12F3FF" },
                }}
              >
                {loading ? (
                  <CircularProgress size={26} sx={{ color: "black" }} />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>

            {/* Info Message */}
            <Typography
              align="center"
              sx={{
                mt: 3,
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.9rem",
              }}
            >
              Didn’t receive OTP?  
              <br />
              It was sent automatically when you opened this page.
            </Typography>

          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
