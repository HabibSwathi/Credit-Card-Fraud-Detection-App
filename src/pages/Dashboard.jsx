// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  CircularProgress,
  Fade,
} from "@mui/material";

import CreditCardIcon from "@mui/icons-material/CreditCard";
import InsightsIcon from "@mui/icons-material/Insights";
import HistoryIcon from "@mui/icons-material/History";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    recent: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const profileRes = await axios.get("/auth/me");
        setUser(profileRes.data.user);

        const summaryRes = await axios.get("/transactions/summary");
        setSummary(summaryRes.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
      setLoading(false);
    };

    loadAll();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0A0F1F",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#00E5FF" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        background: "linear-gradient(135deg, #0A0F1F 0%, #0D1628 100%)",
        color: "white",
      }}
    >
      <Fade in timeout={600}>
        <Box>
          {/* HEADER */}
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 3, color: "#00E5FF" }}
          >
            Dashboard
          </Typography>

          {/* USER CARD */}
          <Paper
            elevation={6}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Welcome, {user?.name}
            </Typography>

            <Typography sx={{ opacity: 0.7 }}>Email: {user?.email}</Typography>
            <Typography sx={{ opacity: 0.7 }}>Phone: {user?.phone}</Typography>
          </Paper>

          {/* SUMMARY CARDS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 3,
              mb: 5,
            }}
          >
            {/* TOTAL TRANSACTIONS */}
            <Paper
              elevation={5}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "rgba(0, 229, 255, 0.1)",
                border: "1px solid rgba(0, 229, 255, 0.25)",
              }}
            >
              <InsightsIcon sx={{ color: "#00E5FF", fontSize: 40 }} />
              <Box>
                <Typography sx={{ opacity: 0.7 }}>Total Transactions</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {summary.totalTransactions}
                </Typography>
              </Box>
            </Paper>

            {/* TOTAL AMOUNT */}
            <Paper
              elevation={5}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "rgba(0, 255, 133, 0.1)",
                border: "1px solid rgba(0, 255, 133, 0.25)",
              }}
            >
              <CreditCardIcon sx={{ color: "#00FF85", fontSize: 40 }} />
              <Box>
                <Typography sx={{ opacity: 0.7 }}>Total Amount</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{summary.totalAmount}
                </Typography>
              </Box>
            </Paper>

            {/* RECENT ACTIVITY */}
            <Paper
              elevation={5}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "rgba(155, 89, 255, 0.1)",
                border: "1px solid rgba(155, 89, 255, 0.25)",
              }}
            >
              <HistoryIcon sx={{ color: "#9B59FF", fontSize: 40 }} />
              <Box>
                <Typography sx={{ opacity: 0.7 }}>Recent Activity</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {summary.recent.length} Records
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* RECENT TRANSACTIONS TABLE */}
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Recent Transactions
            </Typography>

            <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }} />

            {summary.recent.length === 0 ? (
              <Typography sx={{ opacity: 0.5 }}>No recent transactions</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#00E5FF" }}>Date</TableCell>
                    <TableCell sx={{ color: "#00E5FF" }}>Amount</TableCell>
                    <TableCell sx={{ color: "#00E5FF" }}>Decision</TableCell>
                    <TableCell sx={{ color: "#00E5FF" }}>Risk Score</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {summary.recent.map((tx) => (
                    <TableRow
                      key={tx._id}
                      sx={{
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <TableCell sx={{ color: "white" }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        ₹{tx.amount}
                      </TableCell>

                      <TableCell
                        sx={{
                          color:
                            tx.decision === "approved"
                              ? "#00FF85"
                              : tx.decision === "manual_review"
                              ? "#FFC107"
                              : "#FF4E4E",
                          fontWeight: 700,
                        }}
                      >
                        {tx.decision}
                      </TableCell>

                      <TableCell sx={{ color: "white" }}>
                        {tx.riskScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* ACTION BUTTONS */}
          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate("/payment")}
              sx={{
                bgcolor: "#00E5FF",
                color: "#000",
                px: 4,
                py: 1.3,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#00BBD4" },
              }}
            >
              Make Payment
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/history")}
              sx={{
                borderColor: "#00E5FF",
                color: "#00E5FF",
                px: 4,
                py: 1.3,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#00BBD4",
                  color: "#00BBD4",
                },
              }}
            >
              View Full History
            </Button>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
