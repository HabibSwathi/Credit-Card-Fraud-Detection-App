import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import * as faceapi from "face-api.js";

import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Fade,
} from "@mui/material";

export default function FaceEnroll() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const confettiRef = useRef(null);

  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const initializedRef = useRef(false); // 🔒 React 18 guard

  const stableCounterRef = useRef(0);
  const enrollingRef = useRef(false);

  const [message, setMessage] = useState("Preparing...");
  const stableFramesNeeded = 6;

  /* ----------------------------------
     LOAD MODELS
  ---------------------------------- */
  const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  };

  /* ----------------------------------
     CANVAS HELPERS
  ---------------------------------- */
  const fitCanvas = () => {
    if (!videoRef.current || !overlayRef.current) return;
    overlayRef.current.width = videoRef.current.videoWidth;
    overlayRef.current.height = videoRef.current.videoHeight;
    confettiRef.current.width = overlayRef.current.width;
    confettiRef.current.height = overlayRef.current.height;
  };

  /* ----------------------------------
     DRAW DETECTION
  ---------------------------------- */
  const drawDetection = (det) => {
    const ctx = overlayRef.current.getContext("2d");
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    const { x, y, width, height } = det.detection.box;
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
  };

  /* ----------------------------------
     DETECTION LOOP
  ---------------------------------- */
  const runDetectionLoop = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    fitCanvas();

    try {
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        drawDetection(detection);
        stableCounterRef.current++;

        setMessage(
          `Hold steady (${stableCounterRef.current}/${stableFramesNeeded})`
        );

        if (
          stableCounterRef.current >= stableFramesNeeded &&
          !enrollingRef.current
        ) {
          enrollingRef.current = true;
          await uploadDescriptor(Array.from(detection.descriptor));
          return;
        }
      } else {
        stableCounterRef.current = 0;
        setMessage("Center your face clearly...");
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  };

  /* ----------------------------------
     UPLOAD FACE DATA
  ---------------------------------- */
  const uploadDescriptor = async (descriptor) => {
    try {
      setMessage("Uploading face data...");
      await axios.post(
        "/face/enroll",
        { descriptor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Enrollment successful!");
      stopEverything();
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      enrollingRef.current = false;
      stableCounterRef.current = 0;
      setMessage("Enrollment failed. Try again.");
      runDetectionLoop();
    }
  };

  /* ----------------------------------
     STOP EVERYTHING
  ---------------------------------- */
  const stopEverything = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  /* ----------------------------------
     INIT (SAFE IN REACT 18)
  ---------------------------------- */
  useEffect(() => {
    if (!token || initializedRef.current) return;

    initializedRef.current = true;

    const init = async () => {
      try {
        await loadModels();

        // ensure no previous stream is alive
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(t => t.stop());
          videoRef.current.srcObject = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setMessage("Hold your face steady...");
        rafRef.current = requestAnimationFrame(runDetectionLoop);
      } catch (err) {
        console.error("Camera error:", err);
        setMessage("Unable to start camera.");
      }
    };

    init();

    return () => {
      initializedRef.current = false;
      stopEverything();
    };
  }, [token]);

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Fade in timeout={500}>
        <Paper sx={{ p: 4, maxWidth: 450, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Face Enrollment
          </Typography>

          <Typography sx={{ mb: 2 }}>{message}</Typography>

          <Box sx={{ position: "relative" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%" }}
            />
            <canvas ref={overlayRef} style={{ position: "absolute", top: 0, left: 0 }} />
            <canvas ref={confettiRef} style={{ position: "absolute", top: 0, left: 0 }} />
          </Box>

          <CircularProgress sx={{ mt: 2 }} />
        </Paper>
      </Fade>
    </Box>
  );
}
