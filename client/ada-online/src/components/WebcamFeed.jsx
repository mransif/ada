// src/components/WebcamFeed.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import "./WebcamFeed.css";

function WebcamFeed({ isVisible, onClose, socket }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [switchView, setSwitchView] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Function to capture and send frame
  const captureAndSendFrame = useCallback(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !socket?.current ||
      videoRef.current.readyState < videoRef.current.HAVE_METADATA
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    const captureWidth = video.videoWidth;
    const captureHeight = video.videoHeight;
    if (canvas.width !== captureWidth) canvas.width = captureWidth;
    if (canvas.height !== captureHeight) canvas.height = captureHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get frame as base64 encoded JPEG
      const frameDataUrl = canvas.toDataURL("image/jpeg", 0.7);

      // Send frame data via socket
      if (socket.current.connected) {
        socket.current.emit("send_video_frame", { frame: frameDataUrl });
      }
    } catch (e) {
      console.error("Error converting canvas to data URL:", e);
    }
  }, [socket]);

  // Function to stop current stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      console.log("Webcam stream stopped.");
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("Frame capture interval cleared.");
    }
  }, []);

  // Function to start webcam/screen sharing
  const startStream = useCallback(async () => {
    // Stop any existing stream first
    stopStream();

    setHasError(false);
    setErrorMessage("");
    console.log(`Attempting to start ${switchView ? "webcam" : "screen sharing"}...`);

    try {
      let stream;
      if (switchView) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video metadata to load before playing and starting interval
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            console.log(`${switchView ? "Webcam" : "Screen sharing"} stream started and playing.`);

            // Start interval after video is playing
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(captureAndSendFrame, 1000);
            console.log("Frame capture interval started.");
          } catch (playError) {
            console.error("Error playing video stream:", playError);
            setHasError(true);
            setErrorMessage("Could not play video stream.");

            // Cleanup
            stopStream();
          }
        };
      } else {
        console.warn("Video element not available after getting stream...");
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.error(`Error accessing ${switchView ? "webcam" : "screen sharing"}:`, err);
      setHasError(true);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage(`${switchView ? "Webcam" : "Screen sharing"} permission denied...`);
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage(`No ${switchView ? "webcam" : "screen"} found.`);
      } else {
        setErrorMessage(`Could not access ${switchView ? "webcam" : "screen"}. Error: ${err.message}`);
      }

      // Ensure cleanup on error
      stopStream();
    }
  }, [switchView, stopStream, captureAndSendFrame]);

  // Handle switch view button click
  const handleSwitchView = () => {
    setSwitchView(prevState => !prevState);
  };

  // Effect to start/stop the stream based on visibility and view type
  useEffect(() => {
    if (isVisible) {
      startStream();
    } else {
      stopStream();
      setHasError(false);
    }

    // Cleanup function
    return stopStream;
  }, [isVisible, startStream, stopStream, switchView]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isVisible) {
    return null;
  }

  // Calculate position for the component
  const containerStyle = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '360px',
    height: '280px',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: 1000
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="rounded-lg overflow-hidden bg-gray-900 shadow-lg pb-4"
    >
      {/* Drag handle */}
      <div
        className="h-6 bg-gray-800 flex justify-between items-center px-2 cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="text-white text-xs">
          {switchView ? "Webcam" : "Screen Share"}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300"
          aria-label="Close Webcam Feed"
        >
          ×
        </button>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {hasError ? (
        <div className="p-6 text-center bg-red-50 h-full">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="relative h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          ></video>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 px-4">
            <button
              className="px-4 py-2 bg-gray-800 bg-opacity-70 text-white rounded-md hover:bg-opacity-90 transition-colors"
              onClick={handleSwitchView}
            >
              {switchView ? "Screen Share" : "Webcam"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

WebcamFeed.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  socket: PropTypes.object,
};

export default WebcamFeed;