// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Fade,
  Divider,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import PaidIcon from "@mui/icons-material/Paid";
import HistoryIcon from "@mui/icons-material/History";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    recent: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await axios.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats error:", err);
      }
    };

    loadStats();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #0A0F1F, #0D1628)",
        p: 4,
      }}
    >
      <Fade in timeout={500}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: 1250,
            mx: "auto",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#00E5FF",
              fontWeight: 700,
              mb: 3,
              textAlign: "center",
            }}
          >
            Admin Dashboard
          </Typography>

          {/* SUMMARY CARDS */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <PeopleIcon sx={{ fontSize: 40, color: "#00E5FF" }} />
                <Box>
                  <Typography sx={{ color: "#9AB" }}>Total Users</Typography>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                    {stats.totalUsers}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <PaidIcon sx={{ fontSize: 40, color: "#00FF9C" }} />
                <Box>
                  <Typography sx={{ color: "#9AB" }}>Total Transactions</Typography>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                    {stats.totalTransactions}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <HistoryIcon sx={{ fontSize: 40, color: "#C77DFF" }} />
                <Box>
                  <Typography sx={{ color: "#9AB" }}>Recent Records</Typography>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                    {stats.recent.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* RECENT TRANSACTIONS */}
          <Typography variant="h6" sx={{ color: "#00E5FF", fontWeight: 700 }}>
            Recent Transactions
          </Typography>

          <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />

          {stats.recent?.length === 0 ? (
            <Typography sx={{ color: "#C7C7C7" }}>No recent transactions</Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#00E5FF", fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ color: "#00E5FF", fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ color: "#00E5FF", fontWeight: 700 }}>Decision</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stats.recent.map((tx) => (
                    <TableRow
                      key={tx._id}
                      sx={{
                        "&:hover": { background: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <TableCell sx={{ color: "white" }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>₹{tx.amount}</TableCell>
                      <TableCell
                        sx={{
                          color:
                            tx.decision === "approved"
                              ? "#00FF9C"
                              : tx.decision === "manual_review"
                              ? "#FFC107"
                              : "#FF4D4D",
                          fontWeight: 600,
                        }}
                      >
                        {tx.decision}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </Fade>
    </Box>
  );
}
