'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Mic, Camera, MapPin, Send, CheckCircle2, StopCircle, RefreshCw } from 'lucide-react';
import { useDemoStore } from '@/store/demo.store';
import { usePipelineStore } from '@/store/pipeline.store';
import { SignalService } from '@/services/signal.service';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

type Step = 'TYPE' | 'MEDIA' | 'LOCATION' | 'REVIEW' | 'PROCESSING' | 'SUCCESS';

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export default function CitizenFlow() {
  const [step, setStep] = useState<Step>('TYPE');
  const [report, setReport] = useState({ type: '', text: '', location: { lat: 28.6139, lng: 77.2090 }, imageBase64: '', audioBase64: '' });
  const [resultData, setResultData] = useState<any>(null);
  
  const { isDemoMode, simulateIncomingReport } = useDemoStore();
  const { startPipeline, isActive, events, updateEvent } = usePipelineStore();

  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const [isLocating, setIsLocating] = useState(true);

  const nextStep = (s: Step) => {
    if (s === 'LOCATION') {
      setIsLocating(true);
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setReport(r => ({ ...r, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
            setIsLocating(false);
          },
          (err) => {
            console.error(err);
            setIsLocating(false); // fallback to default
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        setIsLocating(false);
      }
    }
    setStep(s);
  };

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
        // Ensure stream tracks are fully stopped
        stream.getTracks().forEach(track => track.stop());
      };
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setLiveTranscript(currentTranscript);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
      }
      
      mediaRecorder.start();
      setIsRecording(true);
      setLiveTranscript('');
    } catch (err) {
      console.error("Audio recording failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (liveTranscript) {
      setReport(r => ({ ...r, text: r.text ? `${r.text}\n${liveTranscript}` : liveTranscript }));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setReport(r => ({ ...r, imageBase64: '' }));
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
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
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
    }
  };

  const retakePhoto = () => {
    startCamera();
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (isDemoMode) {
      simulateIncomingReport();
    }
    nextStep('PROCESSING');
    startPipeline();
    
    // Simulate UI processing animation quickly while backend processes
    let delay = 300;
    events.forEach((event) => {
      setTimeout(() => {
        updateEvent(event.id, { status: 'completed', timestamp: Date.now() });
      }, delay);
      delay += 300;
    });

    try {
      const payload = {
        text: report.text || report.type,
        lat: report.location?.lat || 28.6139,
        lng: report.location?.lng || 77.2090,
        image_base64: report.imageBase64 || undefined,
        audio_base64: report.audioBase64 || undefined,
      };
      
      const response = await SignalService.createSignal(payload);
      
      if (response && response.success) {
        setResultData(response.data);
      } else {
        console.error("API returned success false:", response);
      }
      
      // Ensure all are completed
      events.forEach((event) => {
        updateEvent(event.id, { status: 'completed', timestamp: Date.now() });
      });

      nextStep('SUCCESS');
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
              {cameraActive && (
                <div className="relative mx-auto rounded overflow-hidden border-4 border-black">
                  <video ref={videoRef} className="w-full max-w-md bg-black" playsInline muted autoPlay />
                  <Button variant="primary" className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-[4px_4px_0px_rgba(0,0,0,1)]" onClick={takePhoto}>Capture</Button>
                </div>
              )}
              
              {!cameraActive && report.imageBase64 && (
                <div className="relative mx-auto rounded overflow-hidden border-4 border-black group">
                  <img src={`data:image/jpeg;base64,${report.imageBase64}`} className="w-full max-w-md" alt="Captured" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button variant="primary" onClick={retakePhoto} className="flex gap-2">
                      <RefreshCw size={20} /> Retake Photo
                    </Button>
                  </div>
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
              
              {isRecording && (
                <div className="p-6 border-4 border-black bg-cyan-400 text-black text-left shadow-[6px_6px_0px_rgba(0,0,0,1)] transform scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-2 font-black mb-3 text-black text-xl animate-pulse">
                    <Mic size={24} className="animate-bounce" /> LIVE TRANSCRIPTION
                  </div>
                  <p className="italic font-bold text-2xl leading-relaxed">
                    {liveTranscript || "Speak now... AI is listening to your voice!"}
                  </p>
                </div>
              )}

              {!isRecording && report.audioBase64 && (
                <div className="p-6 border-4 border-black bg-lime-400 text-black text-left shadow-[6px_6px_0px_rgba(0,0,0,1)] transform scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-2 font-black mb-3 text-black text-xl">
                    <CheckCircle2 size={24} /> AUDIO CAPTURED
                  </div>
                  <p className="italic font-bold text-xl line-clamp-3">
                    {report.text || "Your voice has been recorded securely."}
                  </p>
                </div>
              )}
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
                  <span className="font-bold">Stop Recording</span>
                </button>
              )}

              {!cameraActive && !report.imageBase64 && (
                <button onClick={startCamera} className="flex flex-col items-center gap-4 p-8 neo-box hover:bg-neo-bg">
                  <Camera size={48} className="text-neo-accent" />
                  <span className="font-bold">Take Photo</span>
                </button>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={() => nextStep('TYPE')}>Back</Button>
              <Button variant="primary" onClick={() => nextStep('LOCATION')}>Next</Button>
            </div>
          </motion.div>
        )}

        {step === 'LOCATION' && (
          <motion.div key="location" className="space-y-8 text-center">
            <h2 className="text-3xl font-black">Confirm Location</h2>
            
            <div className="h-64 neo-box relative bg-neo-bg overflow-hidden flex items-center justify-center">
              {isLocating ? (
                <div className="flex flex-col items-center gap-4">
                  <MapPin size={48} className="animate-bounce text-neo-danger" />
                  <span className="font-bold">Locating GPS...</span>
                </div>
              ) : (
                <MapContainer 
                  center={[report.location.lat, report.location.lng]} 
                  zoom={16} 
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[report.location.lat, report.location.lng]} />
                </MapContainer>
              )}
            </div>
            
            {!isLocating && (
              <div className="mt-4 text-center">
                <div className="font-mono font-bold bg-white border-2 border-black px-4 py-2 inline-block shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-1">
                  Latitude: {report.location.lat.toFixed(6)} | Longitude: {report.location.lng.toFixed(6)}
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => nextStep('MEDIA')}>Back</Button>
              <Button variant="primary" onClick={() => nextStep('REVIEW')} disabled={isLocating}>Confirm Location</Button>
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
            
            {resultData && resultData.cluster ? (
              <div className="neo-box p-6 bg-neo-bg text-left space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] border-4 border-black">
                <h3 className="text-xl font-bold border-b-4 border-black pb-2 mb-4 uppercase tracking-widest text-neo-accent">AI Explainability</h3>
                <p><strong>Priority Score:</strong> <span className="text-2xl font-black">{resultData.cluster.priority_score.toFixed(0)}/100</span></p>
                <p><strong>Category:</strong> <span className="uppercase font-bold text-lg bg-yellow-100 px-2 py-1 border-2 border-black inline-block">{resultData.cluster.category}</span></p>
                <p><strong>Matched Cluster:</strong> Grouped with <span className="font-bold underline">{resultData.cluster.signals_count - 1}</span> other complaints in this ward.</p>
                <div className="text-sm font-bold bg-white p-4 border-2 border-black italic mt-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <span className="block text-xs uppercase opacity-60 not-italic mb-1 border-b-2 border-black pb-1 w-max">AI Rationale</span>
                  "{resultData.cluster.explanation || "Issue registered and verified by AI. Prioritized for immediate attention."}"
                </div>
              </div>
            ) : (
              <div className="neo-box p-6 bg-neo-bg text-left space-y-4">
                <p className="font-bold text-red-500 bg-red-100 p-2 border-2 border-black">Fallback Result shown (Backend AI could not be reached).</p>
                <h3 className="text-xl font-bold border-b-2 border-neo-border pb-2">AI Explainability</h3>
                <p><strong>Priority Score:</strong> 85/100 (HIGH)</p>
                <p><strong>Category:</strong> Roads - Severe Pothole</p>
                <p><strong>Matched Cluster:</strong> Grouped with 12 other complaints in this ward.</p>
                <p className="text-sm text-neo-text/70 italic mt-4">
                  "High volume of severe road hazard reports in a concentrated 2km radius."
                </p>
              </div>
            )}

            <Button onClick={() => { setReport({ type: '', text: '', location: { lat: 28.6139, lng: 77.2090 }, imageBase64: '', audioBase64: '' }); setResultData(null); nextStep('TYPE'); }} className="w-full mt-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] font-bold text-xl h-14 border-4 border-black">Report Another Issue</Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
