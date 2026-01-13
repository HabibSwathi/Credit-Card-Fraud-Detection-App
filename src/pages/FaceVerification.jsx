// frontend/src/pages/FaceVerification.jsx
import React, { useRef, useState, useEffect  } from "react";
import axios from "../services/api";
import { useAuth } from "../context/AuthContext";
import * as faceapi from "face-api.js";

console.log("FacePay component mounted");

export default function FaceVerification({ onSuccess, onFailure }) {
  const { token } = useAuth();

  const streamRef = useRef(null);
  const initializedRef = useRef(false);


  const videoRef = useRef(null);
  const [msg, setMsg] = useState("Idle...");

  /* ----------------------------------
     LOAD MODELS — SSD ONLY
  ---------------------------------- */
  const loadModels = async () => {
    setMsg("Loading face models...");
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  };

  /* ----------------------------------
     START VERIFICATION
  ---------------------------------- */
  const startVerification = async () => {
    setMsg("Preparing...");

    try {
      await loadModels();
    } catch (err) {
      console.error("Model load error", err);
      setMsg("Failed to load models");
      return;
    }

    let stream;
    try {
      setMsg("Starting camera...");
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

    } catch (err) {
      console.error(err);
      setMsg("Camera access denied");
      return;
    }

    setMsg("Detecting face...");

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

        if (!detection) {
          streamRef.current?.getTracks().forEach(t => t.stop());
          onFailure();
          return;
        }

      const descriptor = Array.from(detection.descriptor);

      setMsg("Verifying identity...");

      const res = await axios.post(
        "/face/verify",
        { descriptor, amount: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.match) {
        onSuccess();
      } else {
        onFailure();
      }

    } catch (err) {
      console.error("Verification error:", err);
      onFailure();
    } finally {
    }
  };

  useEffect(() => {
  if (initializedRef.current) return;
  initializedRef.current = true;

  startVerification();

  return () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };
}, []);


  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>Face Verification</h2>

      <pre
        style={{
          background: "#222",
          color: "#0f0",
          padding: 10,
          marginTop: 10,
        }}
      >
        {msg}
      </pre>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        
        style={{
          width: 360,
          marginTop: 10,
          borderRadius: 8,
          border: "2px solid #555",
        }}
      />
    </div>
  );
}
