import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeVideo } from '../services/geminiService';
import Navbar from '../components/Navbar';

export default function Scanner() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // States
    const [mode, setMode] = useState('initial'); // 'initial', 'camera', 'upload', 'analyzing'
    const [captureMode, setCaptureMode] = useState('photo'); // 'photo' or 'video'
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [gridVisible, setGridVisible] = useState(false);
    const [error, setError] = useState(null);
    const [stream, setStream] = useState(null);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            setTimer(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setMode('camera');
            setError(null);
        } catch (err) {
            console.error("Camera access denied", err);
            setError("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setMode('initial');
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const file = new File([blob], "capture.webm", { type: 'video/webm' });
            await handleAnalysis(file);
        };

        recorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setMode('analyzing');
        }
    };

    const takePhoto = async () => {
        if (!videoRef.current || !stream) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            if (blob) {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                setMode('analyzing');
                await handleAnalysis(file);
            }
        }, 'image/jpeg', 0.8);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMode('analyzing');
            handleAnalysis(file);
        }
    };

    const handleAnalysis = async (file) => {
        setError(null);
        try {
            // Create URL for preview
            const videoUrl = URL.createObjectURL(file);

            const diagnosis = await analyzeVideo(file);
            diagnosis.timestamp = new Date().toISOString(); // Add timestamp

            localStorage.setItem('fixit_diagnosis', JSON.stringify(diagnosis));

            // Save to history
            const history = JSON.parse(localStorage.getItem('fixit_history') || '[]');
            history.push(diagnosis);
            localStorage.setItem('fixit_history', JSON.stringify(history));

            navigate('/results', { state: { videoUrl } });
        } catch (err) {
            console.error("Analysis failed", err);
            setError(err.message || "Analysis failed.");
            setMode(stream ? 'camera' : 'initial');
        }
    };

    return (
        <div className="bg-[#121212] font-sans text-white h-screen w-full flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 relative w-full overflow-hidden flex flex-col">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/*,image/*"
                    className="hidden"
                />

                {/* Background / Video Feed */}
                <div className="absolute inset-0 z-0 bg-black">
                    {mode === 'camera' && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            onLoadedMetadata={() => videoRef.current.play()}
                        />
                    )}
                    {mode === 'initial' && (
                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
                        </div>
                    )}

                    {/* Grid Overlay */}
                    {gridVisible && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="border border-white/10"></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Bar (Floating below Navbar) */}
                <div className="relative z-20 flex justify-center pt-4 pointer-events-none">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRecording ? 'bg-red-500' : 'bg-green-500'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-red-600' : 'bg-green-600'}`}></span>
                            </div>
                            <span className={`text-xs font-bold ${isRecording ? 'text-red-500' : 'text-green-500'} uppercase tracking-widest leading-none`}>
                                {mode === 'analyzing' ? "PROCESSING" : isRecording ? "RECORDING" : "STANDBY"}
                            </span>
                        </div>
                        {isRecording && (
                            <>
                                <div className="hidden sm:block h-4 w-px bg-white/20"></div>
                                <span className="font-mono text-lg font-medium text-white leading-none tracking-widest">
                                    {formatTime(timer)}
                                </span>
                            </>
                        )}
                        {mode === 'camera' && (
                            <button
                                onClick={stopCamera}
                                className="ml-2 hover:bg-white/10 rounded-full p-1 transition-colors"
                                title="Close Camera"
                            >
                                <span className="material-symbols-outlined text-white/70 hover:text-white text-sm">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg border border-red-400 shadow-xl z-50 pointer-events-auto max-w-md text-center">
                        <div className="flex items-center gap-2 mb-1 justify-center">
                            <span className="material-symbols-outlined">error</span>
                            <span className="font-bold uppercase">Error</span>
                        </div>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 relative z-10 flex flex-col justify-center items-center pointer-events-none">
                    {/* Initial Mode Selection */}
                    {mode === 'initial' && (
                        <div className="flex flex-col gap-6 pointer-events-auto animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={startCamera}
                                className="group flex flex-col items-center justify-center w-64 h-40 bg-[#1E1E1E] hover:bg-[#2a2a2a] border border-white/10 hover:border-[#F9A825] rounded-2xl transition-all shadow-2xl"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#F9A825]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[#F9A825] text-4xl">photo_camera</span>
                                </div>
                                <span className="text-lg font-bold uppercase tracking-wider text-white">Start Scanner</span>
                                <span className="text-xs text-white/50 mt-1">Photo & Video Analysis</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="group flex flex-col items-center justify-center w-64 h-32 bg-[#1E1E1E] hover:bg-[#2a2a2a] border border-white/10 hover:border-[#F9A825] rounded-2xl transition-all shadow-2xl"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white/70 text-2xl">upload_file</span>
                                </div>
                                <span className="text-sm font-bold uppercase tracking-wider text-white">Upload File</span>
                            </button>
                        </div>
                    )}

                    {/* Reticle - Changes based on mode */}
                    {mode === 'camera' && !isRecording && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={`border-2 border-white/30 rounded-lg relative transition-all duration-300 ${captureMode === 'photo' ? 'w-[80%] h-[60%]' : 'w-[90%] h-[50%]'}`}>
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#F9A825]"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#F9A825]"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#F9A825]"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#F9A825]"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="relative z-20 pb-8 pt-4 px-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
                    {mode === 'camera' && (
                        <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
                            {/* Mode Toggle */}
                            <div className="flex bg-[#1E1E1E] rounded-full p-1 border border-white/10">
                                <button
                                    onClick={() => setCaptureMode('photo')}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${captureMode === 'photo' ? 'bg-[#F9A825] text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                                >
                                    Photo
                                </button>
                                <button
                                    onClick={() => setCaptureMode('video')}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${captureMode === 'video' ? 'bg-[#F9A825] text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                                >
                                    Video
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-8 w-full">
                                <button
                                    onClick={() => setGridVisible(!gridVisible)}
                                    className={`flex flex-col items-center gap-1 group ${gridVisible ? 'text-[#F9A825]' : 'text-white/50'}`}
                                >
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border ${gridVisible ? 'border-[#F9A825] bg-[#F9A825]/10' : 'border-white/10 bg-[#1E1E1E]'} transition-all`}>
                                        <span className="material-symbols-outlined text-xl">grid_on</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Grid</span>
                                </button>

                                {/* Shutter Button */}
                                <button
                                    onClick={captureMode === 'photo' ? takePhoto : (isRecording ? stopRecording : startRecording)}
                                    className="relative group"
                                >
                                    <div className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${isRecording ? 'bg-red-500/50 scale-125' : 'bg-[#F9A825]/30 scale-100'}`}></div>
                                    <div className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-300 ${isRecording ? 'border-red-500 bg-red-500/10' : 'border-[#F9A825] bg-[#F9A825]'}`}>
                                        <div className={`transition-all duration-300 rounded-sm ${isRecording ? 'w-8 h-8 bg-red-500' : 'w-16 h-16 bg-transparent'}`}>
                                            {!isRecording && <span className="material-symbols-outlined text-black text-4xl">{captureMode === 'photo' ? 'camera' : 'videocam'}</span>}
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={stopCamera}
                                    className="flex flex-col items-center gap-1 group text-white/50 hover:text-white transition-colors"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[#1E1E1E] group-hover:border-white/30 transition-all">
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Flash</span>
                                </button>
                            </div>
                            <p className="text-white/50 text-xs font-medium">
                                {isRecording ? "Tap to stop analysis" : "Tap to start scanning"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}