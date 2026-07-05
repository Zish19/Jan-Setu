'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Mic, Camera, MapPin, Send, CheckCircle2, Square, StopCircle } from 'lucide-react';
import { useDemoStore } from '@/store/demo.store';
import { usePipelineStore } from '@/store/pipeline.store';
import { SignalService } from '@/services/signal.service';

type Step = 'TYPE' | 'MEDIA' | 'LOCATION' | 'REVIEW' | 'PROCESSING' | 'SUCCESS';

export default function CitizenFlow() {
  const [step, setStep] = useState<Step>('TYPE');
  const [report, setReport] = useState({ type: '', text: 'Need fixing.', location: { lat: 28.6139, lng: 77.2090 }, imageBase64: '', audioBase64: '' });
  
  const { isDemoMode, simulateIncomingReport } = useDemoStore();
  const { startPipeline, isActive, events, updateEvent } = usePipelineStore();

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const nextStep = (s: Step) => setStep(s);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setReport(r => ({ ...r, audioBase64: base64String }));
        };
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio recording failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const base64String = dataUrl.split(',')[1];
        setReport(r => ({ ...r, imageBase64: base64String }));
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (isDemoMode) {
      simulateIncomingReport();
    }
    startPipeline();
    nextStep('PROCESSING');
    
    try {
      const payload = {
        text: report.text || report.type,
        lat: report.location?.lat || 28.6139,
        lng: report.location?.lng || 77.2090,
        image_base64: report.imageBase64 || undefined,
        audio_base64: report.audioBase64 || undefined,
      };
      
      await SignalService.createSignal(payload);
      
      let delay = 1000;
      events.forEach((event, i) => {
        setTimeout(() => {
          updateEvent(event.id, { status: 'completed', timestamp: Date.now() });
          if (i === events.length - 1) nextStep('SUCCESS');
        }, delay);
        delay += 800 + Math.random() * 500;
      });

    } catch (err) {
      console.error("Submission failed", err);
      nextStep('SUCCESS'); 
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full neo-box p-8 bg-neo-surface">
      <AnimatePresence mode="wait">
        
        {step === 'TYPE' && (
          <motion.div 
            key="type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-3xl font-black">What do you want to report?</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Roads', 'Water & Sanitation', 'Healthcare', 'Education', 'Others'].map(t => (
                <Button 
                  key={t} 
                  variant="secondary" 
                  onClick={() => { setReport(r => ({ ...r, type: t })); nextStep('MEDIA'); }}
                >
                  {t}
                </Button>
              ))}
            </div>
            {isDemoMode && (
              <div className="pt-8">
                <Button variant="primary" onClick={() => handleSubmit()} className="w-full">
                  Try Demo Report (Auto-fill)
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'MEDIA' && (
          <motion.div 
            key="media"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <h2 className="text-3xl font-black">Describe the issue</h2>
            
            <div className="flex flex-col gap-4">
              {cameraActive ? (
                <div className="relative mx-auto rounded overflow-hidden">
                  <video ref={videoRef} className="w-full max-w-md bg-black" />
                  <Button variant="primary" className="absolute bottom-4 left-1/2 -translate-x-1/2" onClick={takePhoto}>Capture</Button>
                </div>
              ) : report.imageBase64 ? (
                <div className="text-neo-accent font-bold">Photo Captured!</div>
              ) : null}
              
              <canvas ref={canvasRef} className="hidden" />
              
              {report.audioBase64 ? (
                <div className="text-neo-accent font-bold">Audio Recorded!</div>
              ) : null}
            </div>

            <div className="flex justify-center gap-8">
              {!isRecording ? (
                <button onClick={startRecording} className="flex flex-col items-center gap-4 p-8 neo-box hover:bg-neo-bg">
                  <Mic size={48} className="text-neo-accent" />
                  <span className="font-bold">Record Voice</span>
                </button>
              ) : (
                <button onClick={stopRecording} className="flex flex-col items-center gap-4 p-8 neo-box bg-neo-danger text-white animate-pulse">
                  <StopCircle size={48} />
                  <span className="font-bold">Stop</span>
                </button>
              )}

              <button onClick={startCamera} className="flex flex-col items-center gap-4 p-8 neo-box hover:bg-neo-bg">
                <Camera size={48} className="text-neo-accent" />
                <span className="font-bold">Take Photo</span>
              </button>
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => nextStep('TYPE')}>Back</Button>
              <Button variant="primary" onClick={() => nextStep('LOCATION')}>Next</Button>
            </div>
          </motion.div>
        )}

        {step === 'LOCATION' && (
          <motion.div key="location" className="space-y-8 text-center">
            <h2 className="text-3xl font-black">Locating...</h2>
            <div className="h-48 neo-box flex items-center justify-center bg-neo-bg">
              <MapPin size={48} className="animate-bounce text-neo-danger" />
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => nextStep('MEDIA')}>Back</Button>
              <Button variant="primary" onClick={() => nextStep('REVIEW')}>Confirm Location</Button>
            </div>
          </motion.div>
        )}

        {step === 'REVIEW' && (
          <motion.div key="review" className="space-y-8 text-center">
            <h2 className="text-3xl font-black">Ready to Submit</h2>
            <Button variant="primary" size="lg" className="w-full text-2xl" onClick={handleSubmit}>
              <Send className="mr-2" /> Submit Report
            </Button>
          </motion.div>
        )}

        {step === 'PROCESSING' && (
          <motion.div key="processing" className="space-y-4">
            <h2 className="text-3xl font-black text-center mb-8">AI Processing Pipeline</h2>
            {events.map((evt, i) => (
              <div key={evt.id} className="flex items-center gap-4 text-lg font-bold">
                <div className={`w-6 h-6 rounded-full border-2 border-neo-border flex items-center justify-center ${evt.status === 'completed' ? 'bg-neo-accent text-white' : 'bg-neo-surface'}`}>
                  {evt.status === 'completed' && <CheckCircle2 size={16} />}
                </div>
                <span className={evt.status === 'completed' ? 'text-neo-text' : 'text-neo-text/40'}>
                  {evt.name}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {step === 'SUCCESS' && (
          <motion.div key="success" className="space-y-6 text-center">
            <div className="w-24 h-24 mx-auto bg-neo-accent neo-box rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h2 className="text-4xl font-black">Verified & Scored</h2>
            <div className="neo-box p-6 bg-neo-bg text-left space-y-4">
              <h3 className="text-xl font-bold border-b-2 border-neo-border pb-2">AI Explainability</h3>
              <p><strong>Priority Score:</strong> 85/100 (HIGH)</p>
              <p><strong>Category:</strong> Roads - Severe Pothole</p>
              <p><strong>Matched Cluster:</strong> Grouped with 12 other complaints in this ward.</p>
              <p className="text-sm text-neo-text/70 italic mt-4">
                "High volume of severe road hazard reports in a concentrated 2km radius."
              </p>
            </div>
            <Button onClick={() => { setReport({ type: '', text: 'Need fixing.', location: { lat: 28.6139, lng: 77.2090 }, imageBase64: '', audioBase64: '' }); nextStep('TYPE'); }} className="w-full">Report Another</Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
