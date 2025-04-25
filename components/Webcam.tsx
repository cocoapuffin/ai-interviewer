"use client"

import { useEffect, useRef } from 'react';

const WebcamCard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    getCamera();
  }, []);

  return (
    <div className="w-80 h-60 rounded-2xl shadow-lg bg-white overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default WebcamCard;
