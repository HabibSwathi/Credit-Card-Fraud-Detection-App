import React, { useRef } from "react";

function WebcamCapture({ onCapture }) {
  const videoRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    await videoRef.current.play();
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    onCapture(imageData);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="400" />
      <div>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={capturePhoto}>Capture</button>
      </div>
    </div>
  );
}

export default WebcamCapture;
