// frontend/src/pages/History.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api";

import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Fade,
  Divider,
} from "@mui/material";

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/transactions/history");
        setRows(res.data.transactions || []);
      } catch (err) {
        console.error("History load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#0A0F1F",
        }}
      >
        <CircularProgress sx={{ color: "#00E5FF" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A0F1F, #0D1628)",
        p: 4,
      }}
    >
      <Fade in timeout={500}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 950,
            mx: "auto",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(11px)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Header */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#00E5FF",
              mb: 2,
            }}
          >
            Transaction History
          </Typography>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />

          {/* Empty State */}
          {rows.length === 0 ? (
            <Typography
              sx={{
                color: "#C7C7C7",
                textAlign: "center",
                py: 4,
              }}
            >
              No transactions recorded yet.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    {["Date", "Amount", "Decision", "Risk Score", "Merchant"].map(
                      (col) => (
                        <TableCell
                          key={col}
                          sx={{
                            color: "#00E5FF",
                            fontWeight: 700,
                            fontSize: 15,
                          }}
                        >
                          {col}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((r, index) => (
                    <Fade in timeout={300 + index * 80} key={r._id || index}>
                      <TableRow
                        sx={{
                          "&:hover": {
                            background: "rgba(255,255,255,0.08)",
                            transition: "0.28s",
                          },
                        }}
                      >
                        <TableCell sx={{ color: "white" }}>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "Unknown"}
                        </TableCell>

                        <TableCell sx={{ color: "white" }}>
                          ₹{r.amount ?? "0"}
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              r.decision === "approved"
                                ? "#00FF9C"
                                : r.decision === "manual_review"
                                ? "#FFC107"
                                : "#FF4D4D",
                            fontWeight: 600,
                          }}
                        >
                          {r.decision || "N/A"}
                        </TableCell>

                        <TableCell sx={{ color: "white" }}>
                          {r.riskScore ?? "0"}
                        </TableCell>

                        <TableCell
                          sx={{ color: "white", textTransform: "capitalize" }}
                        >
                          {r.merchant || "N/A"}
                        </TableCell>
                      </TableRow>
                    </Fade>
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
