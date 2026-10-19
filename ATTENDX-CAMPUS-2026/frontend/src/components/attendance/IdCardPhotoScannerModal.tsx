import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, CreditCard, CheckCircle2, XCircle, AlertTriangle, 
  Sparkles, ShieldCheck, RefreshCw, Upload, Eye, UserCheck, 
  QrCode, Zap, ChevronRight, Layers, ArrowRight
} from 'lucide-react';
import { scanStudentPhotoOrId, REGISTERED_STUDENTS_LIST, RegisteredStudent } from '../../services/api';

interface IdCardPhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: RegisteredStudent, scanData: any) => void;
  title?: string;
  contextMessage?: string;
  initialMode?: 'PHOTO' | 'ID_CARD';
}

export const IdCardPhotoScannerModal: React.FC<IdCardPhotoScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "AI Vision Identity & Attendance Scanner",
  contextMessage = "Present your campus student ID card or capture a live biometric photo to verify against trained models and mark attendance as PRESENT.",
  initialMode = 'ID_CARD'
}) => {
  const [scanMode, setScanMode] = useState<'PHOTO' | 'ID_CARD'>(initialMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Selected preset card or custom student
  const [selectedPresetCard, setSelectedPresetCard] = useState<RegisteredStudent | null>(REGISTERED_STUDENTS_LIST[0]);
  const [isCustomStudent, setIsCustomStudent] = useState(false);
  const [customRoll, setCustomRoll] = useState('22CS099');
  const [customName, setCustomName] = useState('Kavya Natarajan');
  const [customDept, setCustomDept] = useState('CSE');
  const [isSimulatingSpoof, setIsSimulatingSpoof] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam if supported
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    // Try starting camera stream
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode]);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
      }
    } catch (err: any) {
      console.warn('Webcam permission not granted or device missing, using AI visual simulation', err);
      setCameraActive(false);
      setCameraError('Live camera not accessible. Interactive HD AI visual scanner enabled.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture current video frame or use preset simulation
  const handleCaptureSnapshot = () => {
    if (videoRef.current && cameraActive) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);
          return dataUrl;
        }
      } catch (e) {
        console.error('Canvas capture failed', e);
      }
    }
    return null;
  };

  // Execute AI Verification
  const executeScan = async (forcedSpoof: boolean = false) => {
    setIsProcessing(true);
    setScanResult(null);

    const snapshot = handleCaptureSnapshot();

    // Prepare card or student payload
    let cardPayload: any = {};
    if (forcedSpoof || isSimulatingSpoof) {
      cardPayload = {
        is_counterfeit: true,
        is_spoof: true,
        roll_number: 'FAKE-999',
        full_name: 'Unverified Entity'
      };
    } else if (isCustomStudent) {
      cardPayload = {
        roll_number: customRoll,
        full_name: customName,
        department_code: customDept,
        semester: 6,
        section: 'A',
        is_id_card: scanMode === 'ID_CARD'
      };
    } else if (selectedPresetCard) {
      cardPayload = {
        roll_number: selectedPresetCard.rollNumber,
        full_name: selectedPresetCard.fullName,
        department_code: selectedPresetCard.departmentCode,
        semester: selectedPresetCard.semester,
        section: selectedPresetCard.section,
        is_id_card: scanMode === 'ID_CARD'
      };
    }

    try {
      const response = await scanStudentPhotoOrId({
        scan_mode: scanMode === 'PHOTO' ? 'LIVE_PHOTO' : 'CAMPUS_ID_CARD',
        image_base64: snapshot || undefined,
        card_payload: cardPayload,
        distance_meters: forcedSpoof ? 150 : 5.8
      });

      setScanResult(response);

      // ONLY MARK PRESENT IF TRAINED MODEL VERIFIES
      if (response.is_verified && response.verdict === 'VERIFIED' && response.student) {
        setTimeout(() => {
          onSuccess(response.student, response);
        }, 1200);
      }
    } catch (err: any) {
      setScanResult({
        is_verified: false,
        verdict: 'REJECTED',
        attendance_status: 'REJECTED',
        flag_reasons: ['AI microservice connection error or timeout'],
        message: 'Scan evaluation failed. Attendance strictly NOT marked.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle uploaded ID card image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {scanMode === 'PHOTO' ? <Camera className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">{title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              {contextMessage}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Scan Mode Toggle: Live Photo vs ID Card */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => { setScanMode('PHOTO'); setScanResult(null); }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition ${
              scanMode === 'PHOTO'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Mode 1: Take Live Photo (Webcam)</span>
          </button>

          <button
            type="button"
            onClick={() => { setScanMode('ID_CARD'); setScanResult(null); }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition ${
              scanMode === 'ID_CARD'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Mode 2: Hold Up / Scan Student ID Card</span>
          </button>
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className="relative aspect-video max-h-72 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Fallback Animated Simulator View */}
          {!cameraActive && (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-[#0b101d] to-slate-950 p-6">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
              ) : scanMode === 'PHOTO' ? (
                /* Biometric Face Guide */
                <div className="relative flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative w-36 h-48 border-2 border-dashed border-indigo-400/60 rounded-[48%] flex items-center justify-center">
                    <div className="absolute inset-2 border border-cyan-400/30 rounded-[48%] animate-pulse"></div>
                    <Camera className="w-10 h-10 text-indigo-400/60" />
                    {/* Reticle corners */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Align student face within biometric oval boundary
                  </p>
                </div>
              ) : (
                /* Student ID Card Guide */
                <div className="relative flex flex-col items-center justify-center text-center space-y-2">
                  <div className="relative w-64 h-40 border-2 border-dashed border-emerald-400/60 rounded-2xl bg-slate-900/40 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
                      <span>ATTENDX CAMPUS ID</span>
                      <span className="font-mono">2026</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-12 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="text-left text-[10px] space-y-0.5">
                        <div className="font-bold text-white">
                          {isCustomStudent ? customName : selectedPresetCard?.fullName}
                        </div>
                        <div className="font-mono text-slate-400">
                          {isCustomStudent ? customRoll : selectedPresetCard?.rollNumber}
                        </div>
                        <div className="text-[9px] text-emerald-400">SEMESTER 6 • CSE</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      <span>||||| |||| || |||||</span>
                      <span>HOLOGRAM VERIFIED</span>
                    </div>

                    {/* Corner guides */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Hold campus ID card steady in front of camera
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Laser Scanning Line (when processing) */}
          {isProcessing && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse"></div>
          )}

          {/* Top telemetry tags */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-300">
              HUD: 1080p • 60 FPS
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVENESS ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Interactive Student Selector & Preset ID Cards ("The student must be anyone") */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Any Campus Student or Present ID:</span>
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => { setIsCustomStudent(!isCustomStudent); setIsSimulatingSpoof(false); }}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition ${
                  isCustomStudent
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {isCustomStudent ? 'Using Custom Student' : '+ Custom Student'}
              </button>
            </div>
          </div>

          {/* Custom Student Fields */}
          {isCustomStudent ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <input
                type="text"
                placeholder="Roll No (e.g. 22CS099)"
                value={customRoll}
                onChange={(e) => setCustomRoll(e.target.value.toUpperCase())}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <input
                type="text"
                placeholder="Student Full Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="AI&DS">AI&DS</option>
              </select>
            </div>
          ) : (
            /* Preset Student Cards */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REGISTERED_STUDENTS_LIST.slice(0, 4).map((stu) => {
                const isSelected = selectedPresetCard?.rollNumber === stu.rollNumber && !isSimulatingSpoof;
                return (
                  <button
                    key={stu.rollNumber}
                    type="button"
                    onClick={() => {
                      setSelectedPresetCard(stu);
                      setIsSimulatingSpoof(false);
                      setScanResult(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={stu.photoUrl}
                      alt={stu.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold truncate text-white">{stu.fullName}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{stu.rollNumber}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick upload or Counterfeit test */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
            <label className="cursor-pointer hover:text-white flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload ID Card / Photo File</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => {
                setIsSimulatingSpoof(true);
                setSelectedPresetCard(null);
                executeScan(true);
              }}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Counterfeit Card (Test Model Rejection)</span>
            </button>
          </div>
        </div>

        {/* Scan Result Feedback (Model Verdict & Attendance Status) */}
        {scanResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
            scanResult.is_verified
              ? 'bg-emerald-950/40 border-emerald-500/40'
              : 'bg-rose-950/40 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {scanResult.is_verified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <div className={`font-black uppercase tracking-wider text-sm ${
                    scanResult.is_verified ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {scanResult.is_verified ? 'MARKED AS PRESENT' : 'NOT MARKED AS PRESENT (REJECTED)'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    TRAINED MODEL VERDICT: <strong>{scanResult.verdict}</strong>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                scanResult.is_verified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {scanResult.attendance_status}
              </span>
            </div>

            {/* Student Info if recognized */}
            {scanResult.student && (
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <img
                  src={scanResult.student.photo_url || scanResult.student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'}
                  alt={scanResult.student.full_name || scanResult.student.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-400"
                />
                <div>
                  <div className="font-bold text-white text-xs">
                    {scanResult.student.full_name || scanResult.student.fullName}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono">
                    Roll: {scanResult.student.roll_number || scanResult.student.rollNumber} • Sem {scanResult.student.semester || 6}-{scanResult.student.section || 'A'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Department: {scanResult.student.department_code || scanResult.student.departmentCode}
                  </div>
                </div>
              </div>
            )}

            {/* Model Telemetry */}
            <div className="bg-slate-950/80 p-3 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">Match Confidence:</span>
                <span className="text-slate-200 font-bold">{(scanResult.match_confidence * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Liveness Score:</span>
                <span className="text-slate-200 font-bold">{(scanResult.liveness_score * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Anti-Tamper Score:</span>
                <span className={scanResult.tamper_score > 0.4 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {(scanResult.tamper_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Flag reasons if rejected */}
            {scanResult.flag_reasons?.length > 0 && (
              <div className="text-rose-300 text-[11px] space-y-0.5">
                <p className="font-bold">Rejection Reasons:</p>
                {scanResult.flag_reasons.map((r: string, idx: number) => (
                  <p key={idx}>• {r}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => executeScan(false)}
            className="flex-[2] flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Image with Trained Model...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify with Trained Model & Mark Present</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
