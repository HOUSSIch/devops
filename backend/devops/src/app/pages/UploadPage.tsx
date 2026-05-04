import { useState, ChangeEvent, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";


import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { PageTransition } from "../components/PageTransition";

import { motion, AnimatePresence } from "motion/react";
import { Upload, AlertCircle, X, Crown, Camera } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { usePhotoLimit } from "../../hooks/useFeatureAccess";
import { toast } from "sonner";

export function UploadPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated, isInitialized, login, refreshNow } = useAuth();
  const { maxPhotos } = usePhotoLimit();

  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isCentered, setIsCentered] = useState(false);

  const webcamRef = useRef<Webcam | null>(null);

  // 🔊 SOUND FIX (UNLOCK AFTER USER CLICK)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/beep.mp3");

      // unlock audio (browser requirement)
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        })
        .catch(() => {});
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // 📂 Upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const remainingSlots = maxPhotos - files.length;

    if (remainingSlots === 0) {
      toast.error(`Max ${maxPhotos} images reached`);
      return;
    }

    setFiles((prev) => [...prev, ...newFiles.slice(0, remainingSlots)]);
  };

  // ❌ remove
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 📸 capture
  const capturePhoto = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const file = new File([ab], "camera.jpg", { type: mimeString });

    setFiles((prev) => [...prev, file].slice(0, maxPhotos));
    setShowCamera(false);
  };

  // 🎯 simple center effect (visual only)
  useEffect(() => {
    if (!showCamera) return;

    const interval = setInterval(() => {
      const centered = Math.random() > 0.5;

      setIsCentered(centered);

      if (centered) {
        playSound();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showCamera]);

  // 🚀 analyze
  const handleAnalyze = async () => {
    if (!files.length) return toast.error("Upload at least one photo");

    if (!isInitialized) return toast.error("Auth initializing...");
    if (!isAuthenticated) {
      login("/upload");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("image", files[0]);

    try {
      await refreshNow();

      const res = await fetch("http://localhost:3000/ai/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error");

      localStorage.setItem("skinAnalysisResult", JSON.stringify(data));
      navigate("/results");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageTransition direction="left">
      
      <div className="min-h-screen bg-[#f4edf9] dark:bg-[#1a0f2e] flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-5xl space-y-6">

          <ProgressIndicator currentStep={3} totalSteps={4} />

          <GlassCard className="p-8 space-y-8">

            {/* HEADER */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
                Upload Your Photos
              </h2>
              <p className="text-gray-500 text-sm">
                Upload up to {maxPhotos} clear photos for AI skin analysis
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-purple-200 shadow-sm">
                <Crown className="w-4 h-4 text-[#8b63d3]" />
                <span className="text-sm font-semibold">
                  {maxPhotos} Image{maxPhotos > 1 ? 's' : ''}
                </span>
              </div>
            </div>
             <div className="space-y-6">
              {/* Photo Counter */}
              <div className="flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Photos uploaded: <strong>{files.length} / {maxPhotos}</strong>
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: maxPhotos }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index < files.length
                          ? "bg-[#8b63d3] scale-110"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

            {/* ACTION CARDS */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* CAMERA */}
              <div
                onClick={() => {
                  initSound(); // 🔥 unlock sound
                  setShowCamera(true);
                }}
                className="cursor-pointer group rounded-2xl p-8 text-center border bg-white/60 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-[#8b63d3] rounded-full flex items-center justify-center">
                  <Camera className="text-white" />
                </div>

                <h3 className="font-semibold text-lg">Use Camera</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Take photos with your webcam
                </p>
              </div>

              {/* UPLOAD */}
              <label className="cursor-pointer group rounded-2xl p-8 text-center border bg-white/60 hover:shadow-xl transition-all hover:-translate-y-1">
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <div className="w-14 h-14 mx-auto mb-4 bg-[#8b63d3] rounded-full flex items-center justify-center">
                  <Upload className="text-white" />
                </div>

                <h3 className="font-semibold text-lg">Upload Files</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choose photos from your device
                </p>
              </label>
            </div>

            {/* PREVIEW */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden border">
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <Button
              className="w-full h-12 text-lg font-semibold"
              onClick={handleAnalyze}
              disabled={uploading}
            >
              {uploading ? "Analyzing..." : "Analyze My Skin ✨"}
            </Button>
          </div>

          </GlassCard>

          {/* INFO */}
         <GlassCard className="bg-purple-50/50 dark:bg-purple-900/20 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#8b63d3] mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="mb-3 font-semibold">📸 For best results, upload photos from different angles:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Front view (face forward)</li>
                        <li>Left side profile</li>
                        <li>Right side profile</li>
                      </ul>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Use natural lighting</li>
                        <li>Remove makeup if possible</li>
                        <li>Ensure photos are clear and focused</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </GlassCard>

        </div>

        {/* CAMERA MODAL */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

            <div className="relative">

              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-2xl"
              />

              {/* 🎯 OVAL GUIDE */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-60 h-80 rounded-full border-4 transition-all duration-300 ${
                    isCentered
                      ? "border-green-400 shadow-[0_0_40px_#22c55e]"
                      : "border-white/40"
                  }`}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <Button onClick={capturePhoto}>Capture</Button>
                <Button
                  onClick={() => setShowCamera(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}