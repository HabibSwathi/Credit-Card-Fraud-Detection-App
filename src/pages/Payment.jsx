import React, { useState, useEffect } from "react";
import axios from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Fade,
} from "@mui/material";

import CreditCardIcon from "@mui/icons-material/CreditCard";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ INSIDE component

  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [risk, setRisk] = useState(null);

  /* ----------------------------------
     RECEIVE RESULT FROM FACE PAY
  ---------------------------------- */
  useEffect(() => {
    if (location.state) {
      setResult(location.state.result || null);
      setStatus(location.state.status || null);
      setRisk(location.state.risk || null);
    }
  }, [location.state]);

  /* ----------------------------------
     HANDLE PAYMENT
  ---------------------------------- */
  const handlePay = async (e) => {
    e.preventDefault();

    if (!amount) return alert("Enter amount");

    setLoading(true);

    try {
      const payload = {
        amount: Number(amount),
        merchant: merchant || "Unknown Merchant",
        purpose: purpose || "General Payment",
        useFace: false,
      };

      const res = await axios.post("/fraud/evaluate", payload);
      setResult(res.data);

      if (res.data.decision === "approved") {
        alert("Payment Approved");
        navigate("/history");
        return;
      }

      if (res.data.requireFace === true || res.data.decision === "manual_review") {
        navigate("/face-pay", {
          state: { amount: Number(amount), merchant, purpose },
        });
        return;
      }

      alert("Payment Rejected (High Risk)");
    } catch (err) {
      console.error("Payment Error:", err);
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A0F1F, #0D1628)",
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Fade in timeout={600}>
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: 4,
            mt: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 25px rgba(0, 229, 255, 0.18)",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <CreditCardIcon sx={{ color: "#00E5FF", fontSize: 34 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg, #00E5FF, #00FFC3)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Make a Payment
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handlePay}>
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Merchant Name"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Purpose (optional)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: "#00E5FF",
                color: "#000",
                py: 1.2,
                fontSize: "1rem",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                "&:hover": { bgcolor: "#12F3FF" },
              }}
            >
              {loading ? (
                <CircularProgress size={26} sx={{ color: "#000" }} />
              ) : (
                "Pay Now"
              )}
            </Button>
          </form>

          {/* Result Summary */}
          {(result || status) && (
            <Fade in timeout={400}>
              <Box sx={{ mt: 4, p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: "#00E5FF", mb: 1 }}>
                  Payment Result
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {status && (
                  <Typography sx={{ color: "white" }}>
                    <strong>Status:</strong> {status}
                  </Typography>
                )}

                {risk && (
                  <Typography sx={{ color: "white" }}>
                    <strong>Risk:</strong> {risk}
                  </Typography>
                )}

                {result?.decision && (
                  <Typography sx={{ color: "white" }}>
                    <strong>Decision:</strong> {result.decision}
                  </Typography>
                )}
              </Box>
            </Fade>
          )}
        </Paper>
      </Fade>
    </Box>
  );
}
