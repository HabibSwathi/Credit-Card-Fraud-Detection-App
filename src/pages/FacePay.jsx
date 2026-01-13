import React, { useRef, useState, useEffect } from "react";
import axios from "../services/api";
import { useAuth } from "../context/AuthContext";
import * as faceapi from "face-api.js";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

export default function FacePay() {
  const [transactionId, setTransactionId] = useState(null);
  const verifyingRef = useRef(false);
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const location = useLocation();
  const [requireFaceVerification, setRequireFaceVerification] = useState(false);
  const cameraStartedRef = useRef(false);
  const { token } = useAuth();

  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const confettiRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  /* ----------------------------------
     INIT FROM PAYMENT
  ---------------------------------- */
useEffect(() => {
  if (!location.state?.amount) return;

  setAmount(location.state.amount);
  setRequireFaceVerification(true);
  setStatus("Additional verification required");

  // 🔑 CREATE TRANSACTION ONCE
  (async () => {
    try {
      const res = await axios.post("/transactions/init", {
        amount: location.state.amount,
        decision: "manual_review",
      });
      setTransactionId(res.data.transactionId);
    } catch (err) {
      console.error("Init transaction failed", err);
    }
  })();

}, [location.state]);


  const stableFramesNeeded = 3;
  const stableCounterRef = useRef(0);

  /* ----------------------------------
     LOAD FACE MODELS (ONCE)
  ---------------------------------- */
  const loadModels = async () => {
    if (modelsLoaded) return;

    setStatus("Loading face models...");
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    setModelsLoaded(true);
    setStatus("Models loaded");
  };

  /* ----------------------------------
     HANDLE PAYMENT (RISK FIRST)
  ---------------------------------- */
  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);
    setResult(null);
    setStatus("Checking risk...");

    try {
      const res = await axios.post(
        "/transaction/pay",
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // LOW / HIGH RISK → DONE
      if (res.data.decision !== "manual_review") {
        setResult(res.data);
        setStatus(res.data.decision);
        setLoading(false);
        return;
      }

      // MEDIUM RISK → FACE
      setStatus("Additional verification required");
      setRequireFaceVerification(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus("Transaction failed");
      setLoading(false);
    }
  };

  /* ----------------------------------
     AUTO START CAMERA
  ---------------------------------- */
useEffect(() => {
   if (!requireFaceVerification || !transactionId) return;

  const t = setTimeout(() => {
    startCameraAndDetect();
  }, 300);

  return () => clearTimeout(t);
}, [requireFaceVerification, transactionId]);


  /* ----------------------------------
     START CAMERA + DETECTION
  ---------------------------------- */
  const startCameraAndDetect = async () => {
    console.log("START CAMERA FUNCTION CALLED");

    if (cameraStartedRef.current) return;
    cameraStartedRef.current = true;

    setLoading(true);
    stableCounterRef.current = 0;

    try {
      await loadModels();
    } catch {
      cameraStartedRef.current = false;
      setLoading(false);
      return;
    }

    try {
      console.log("REQUESTING CAMERA ACCESS");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      console.log("CAMERA STREAM RECEIVED", stream);

      if (!videoRef.current) {
        stream.getTracks().forEach(t => t.stop());
        cameraStartedRef.current = false;
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setCameraActive(true);
      setStatus("Detecting face… hold steady");
      runDetectionLoop();
    } catch (err) {
      console.error("Camera error:", err);
      cameraStartedRef.current = false;
      setStatus("Camera access failed");
      setLoading(false);
    }
  };

  /* ----------------------------------
     CANVAS HELPERS
  ---------------------------------- */
  const fitCanvasToVideo = () => {
    if (!videoRef.current || !overlayRef.current) return;

    overlayRef.current.width = videoRef.current.videoWidth;
    overlayRef.current.height = videoRef.current.videoHeight;
  };

  const clearOverlay = () => {
    const ctx = overlayRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
  };

  /* ----------------------------------
     FACE DETECTION LOOP
  ---------------------------------- */
  const runDetectionLoop = async () => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    fitCanvasToVideo();
    clearOverlay();

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        drawDetection(detection);
        stableCounterRef.current++;

        if (stableCounterRef.current >= stableFramesNeeded) {
          stableCounterRef.current = 0;

          // 🔑 prevent multiple calls
          if (verifyingRef.current) return;
          verifyingRef.current = true;

          // 🔑 STOP detection FIRST
          cancelAnimationFrame(rafRef.current);
          streamRef.current?.getTracks().forEach(t => t.stop());
          cameraStartedRef.current = false;

          await handleDescriptor(Array.from(detection.descriptor));
          return;
        }
      } else {
        stableCounterRef.current = 0;
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  };

  /* ----------------------------------
     DRAW FACE BOX
  ---------------------------------- */
  const drawDetection = (detection) => {
    const ctx = overlayRef.current.getContext("2d");
    const { x, y, width, height } = detection.detection.box;
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
  };

  /* ----------------------------------
     VERIFY FACE
  ---------------------------------- */
  const handleDescriptor = async (descriptor) => {
    setStatus("Verifying…");

    // 🔑 ABSOLUTE REQUIREMENT
    if (!transactionId) {
      console.error("Transaction ID not ready yet");
      setStatus("Please retry payment");
      return;
    }

    try {
      // 1️⃣ Face verification
      const verifyRes = await axios.post(
        "/face/verify",
        { descriptor, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ❌ Face rejected → go back
      if (verifyRes.data.decision !== "approved") {
        if (!transactionId) {
          throw new Error("Transaction ID missing during reject");
        }

        await axios.post(
          "/transactions/confirm",
          {
            transactionId,
            decision: "rejected",
            riskScore: verifyRes.data.risk,
            reasons: verifyRes.data.reasons,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        stopAll();

        navigate("/payment", {
          state: {
            status: "DECLINED",
            risk: "FACE_MISMATCH",
            result: {
              decision: "rejected",
              reason: "Face verification failed",
            },
          },
        });
        return;
      }

      // 2️⃣ Confirm transaction (backend settlement)
      await axios.post(
        "/transactions/confirm",
        {
          transactionId,
          decision: "approved",
          riskScore: verifyRes.data.risk,   // 🔑 correct field
          reasons: verifyRes.data.reasons,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ SUCCESS → navigate back
      stopAll();

      navigate("/payment", {
        state: {
          status: "ACCEPTED",
          risk: "AMOUNT IS MORE THAN USUAL",
          result: {
            decision: "approved",
            verification: "FACE",
            reason: "Face verification successful",
          },
        },
      });
      return;

    } catch (err) {
      console.error(err);
      stopAll();

      navigate("/payment", {
        state: {
          status: "FAILED",
          risk: "TECHNICAL_ERROR",
          result: {
            decision: "failed",
            reason: "Server error during verification",
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     STOP CAMERA
  ---------------------------------- */
  const stopAll = () => {
    cameraStartedRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  useEffect(() => {
    return () => stopAll();
  }, []);

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h6">{status}</Typography>

        {!requireFaceVerification && (
          <>
            <TextField
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ my: 2 }}
              fullWidth
            />
            <Button onClick={handlePay} disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Proceed"}
            </Button>
          </>
        )}

        {requireFaceVerification && (
          <Box sx={{ position: "relative", mt: 2 }}>
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              style={{ width: "100%" }}
            />
            <canvas
              ref={overlayRef}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
