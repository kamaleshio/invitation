import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  User, 
  Trash2, 
  RefreshCw,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  X,
  Move
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';

interface MemoryCardGeneratorProps {
  initialStudentName?: string;
}

export const MemoryCardGeneratorSection: React.FC<MemoryCardGeneratorProps> = ({ initialStudentName }) => {
  const { 
    currentRegistrant, 
    registrations, 
    recordCardGenerated 
  } = useReunionData();

  // Student Name & Standard State
  const [studentName, setStudentName] = useState<string>(() => {
    if (initialStudentName) return initialStudentName;
    if (currentRegistrant?.name) return currentRegistrant.name;
    const stored = localStorage.getItem('star_matric_last_registered_student');
    if (stored) {
      const lower = stored.toLowerCase();
      if (lower.includes('krithik') || lower.includes('karthik') || lower.includes('priya') || lower.includes('senthil') || lower.includes('anand')) {
        try { localStorage.removeItem('star_matric_last_registered_student'); } catch {}
        return "";
      }
      return stored;
    }
    return "";
  });

  const [studentBatch, setStudentBatch] = useState<string>(() => {
    if (currentRegistrant?.batch) return currentRegistrant.batch;
    const stored = localStorage.getItem('star_matric_last_registered_batch');
    if (stored) return stored;
    return "XII - A";
  });

  // Photo & Canvas State
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [hasConsent, setHasConsent] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [downloadedCardUrl, setDownloadedCardUrl] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [templateImg, setTemplateImg] = useState<HTMLImageElement | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const idCardTemplateImgRef = useRef<HTMLImageElement | null>(null);

  // Preload master blank ID card template image across all valid public paths
  useEffect(() => {
    let isMounted = true;
    const candidates = [
      '/star-id-card-template.jpg',
      '/images/star-school-id-template.png',
      '/images/star-id-card-template.jpg',
      'star-id-card-template.jpg'
    ];

    let candidateIdx = 0;
    const loadNext = () => {
      if (candidateIdx >= candidates.length || !isMounted) return;
      const src = candidates[candidateIdx++];
      const img = new Image();
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        if (!isMounted) return;
        idCardTemplateImgRef.current = img;
        setTemplateImg(img);
      };
      img.onerror = () => {
        loadNext();
      };
      img.src = src;
    };

    loadNext();

    return () => { isMounted = false; };
  }, []);

  // Sync initial student name & standard if passed or registered
  useEffect(() => {
    if (initialStudentName) {
      setStudentName(initialStudentName);
      const matched = registrations.find(r => r.name.toLowerCase() === initialStudentName.toLowerCase());
      if (matched?.batch) setStudentBatch(matched.batch);
      if (matched?.photo_url) loadPhotoFromUrl(matched.photo_url);
    } else if (currentRegistrant?.name) {
      setStudentName(currentRegistrant.name);
      if (currentRegistrant.batch) setStudentBatch(currentRegistrant.batch);
      if (currentRegistrant.photo_url) loadPhotoFromUrl(currentRegistrant.photo_url);
    }
  }, [initialStudentName, currentRegistrant, registrations]);

  // Load photo by URL (from registered student or upload)
  const loadPhotoFromUrl = (url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setPhotoImg(img);
      setPhotoSrc(url);
      setPanX(0);
      setPanY(0);
      setZoom(1);
    };
    img.onerror = () => {
      setPhotoImg(null);
      setPhotoSrc(null);
      setUploadError("Unable to load the photo. Please upload your photo directly.");
    };
    img.src = url;
  };

  // Check stored photo in localStorage on mount
  useEffect(() => {
    if (!photoImg && !photoSrc) {
      const storedPhoto = localStorage.getItem('star_matric_last_registered_photo');
      if (storedPhoto) {
        loadPhotoFromUrl(storedPhoto);
      }
    }
  }, []);

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    setUploadError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Photograph must be under 10MB.");
      return;
    }

    sound.playPop();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setPhotoImg(img);
        setPhotoSrc(dataUrl);
        setPanX(0);
        setPanY(0);
        setZoom(1);
        try {
          localStorage.setItem('star_matric_last_registered_photo', dataUrl);
        } catch {}
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setUploadError("Failed to read the image file. Please try another.");
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemovePhoto = () => {
    sound.playPop();
    setPhotoSrc(null);
    setPhotoImg(null);
    setPanX(0);
    setPanY(0);
    setZoom(1);
    try {
      localStorage.removeItem('star_matric_last_registered_photo');
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAdjustments = () => {
    sound.playPop();
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Canvas Mouse / Touch Pan Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoImg) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !photoImg) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // DRAW CANVAS ENGINE
  const renderCardToCanvas = useCallback((canvas: HTMLCanvasElement, forExport: boolean = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Master blank ID template dimensions: 776 x 1024
    const width = 776;
    const height = 1024;
    canvas.width = width;
    canvas.height = height;

    const activeTemplate = (templateImg && templateImg.complete && templateImg.naturalWidth > 0)
      ? templateImg
      : (idCardTemplateImgRef.current && idCardTemplateImgRef.current.complete && idCardTemplateImgRef.current.naturalWidth > 0)
        ? idCardTemplateImgRef.current
        : null;

    // 1. Draw original ID card template or authentic vector replica
    if (activeTemplate) {
      ctx.drawImage(activeTemplate, 0, 0, width, height);
    } else {
      // High-Fidelity Vector Star Matric School ID Card Fallback
      ctx.fillStyle = '#FFFDF0';
      ctx.fillRect(0, 0, width, height);

      // Deep Red School Borders
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // Top Red School Header Banner
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(12, 12, width - 24, 150);

      // School Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px "Outfit", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STAR MATRIC HR. SEC. SCHOOL', width / 2, 72);

      ctx.font = '700 20px "Outfit", Arial, sans-serif';
      ctx.fillStyle = '#FDE68A';
      ctx.fillText('KARUR - 639 005', width / 2, 108);

      ctx.font = '800 18px "Outfit", Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('STUDENT IDENTITY CARD', width / 2, 138);

      // Labels on Body
      ctx.fillStyle = '#991B1B';
      ctx.font = '900 24px "Outfit", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('NAME :', 150, 663);
      ctx.fillText('STD  :', 150, 733);

      // Dotted underline
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 670);
      ctx.lineTo(620, 670);
      ctx.moveTo(250, 740);
      ctx.lineTo(620, 740);
      ctx.stroke();

      // Signature line
      ctx.fillStyle = '#594337';
      ctx.font = '700 16px "Outfit", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Principal / Headmaster', width - 80, 920);

      // Bottom Red Ribbon
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(12, height - 55, width - 24, 43);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 16px "Outfit", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ph: 04324-222444  •  E-mail: starmatricschool@gmail.com', width / 2, height - 28);
    }

    // 2. Exact Photo Frame Coordinates from original blank ID template:
    // Inner Portrait Frame: x: 254, y: 310, w: 268, h: 302
    const frameX = 254;
    const frameY = 310;
    const frameW = 268;
    const frameH = 302;

    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameW, frameH);
    ctx.clip();

    if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
      const scale = zoom;
      const naturalAspect = photoImg.naturalWidth / photoImg.naturalHeight;
      const frameAspect = frameW / frameH;

      let renderW: number;
      let renderH: number;

      if (naturalAspect > frameAspect) {
        renderH = frameH * scale;
        renderW = renderH * naturalAspect;
      } else {
        renderW = frameW * scale;
        renderH = renderW / naturalAspect;
      }

      const renderX = frameX + (frameW - renderW) / 2 + panX;
      const renderY = frameY + (frameH - renderH) / 2 + panY;

      ctx.drawImage(photoImg, renderX, renderY, renderW, renderH);
    } else {
      // Neutral clean placeholder prompting upload
      ctx.fillStyle = '#F3EFEA';
      ctx.fillRect(frameX, frameY, frameW, frameH);
      
      ctx.fillStyle = '#927B6C';
      ctx.font = 'bold 18px "Outfit", "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UPLOAD PHOTO', frameX + frameW / 2, frameY + frameH / 2 - 10);
      ctx.font = '13px "Outfit", "Segoe UI", Arial, sans-serif';
      ctx.fillText('JPG, PNG or WebP', frameX + frameW / 2, frameY + frameH / 2 + 16);
    }
    ctx.restore();

    // Sharp Red Frame Border (matching original template)
    ctx.strokeStyle = '#D41414';
    ctx.lineWidth = 4;
    ctx.strokeRect(251, 307, 274, 308);

    // 3. Exact Text Placement:
    // Student Name on "Name :" line (x: 285, y: 663)
    ctx.fillStyle = '#111827';
    ctx.font = '900 24px "Outfit", "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const cleanName = studentName.trim();
    if (cleanName) {
      ctx.fillText(cleanName.toUpperCase(), 285, 663);
    }

    // Student Standard on "Std :" line (x: 290, y: 733)
    ctx.fillStyle = '#111827';
    ctx.font = '800 23px "Outfit", "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const cleanBatch = studentBatch.trim();
    if (cleanBatch) {
      ctx.fillText(cleanBatch.toUpperCase(), 290, 733);
    }

  }, [studentName, studentBatch, photoImg, zoom, panX, panY, templateImg]);

  // Redraw Preview Canvas on state changes
  useEffect(() => {
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      renderCardToCanvas(previewCanvas, false);
    }
  }, [renderCardToCanvas]);

  // HIGH-QUALITY PNG EXPORT
  const handleDownloadPNG = async () => {
    if (!hasConsent) {
      setUploadError("Please check the consent box to confirm processing your photo.");
      return;
    }

    setIsExporting(true);
    sound.playCelebration();

    try {
      // Ensure master ID card template image is loaded if not already in state
      if (!templateImg || !templateImg.complete || templateImg.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          const testImg = new Image();
          testImg.onload = () => {
            idCardTemplateImgRef.current = testImg;
            setTemplateImg(testImg);
            resolve();
          };
          testImg.onerror = () => resolve();
          testImg.src = '/star-id-card-template.jpg';
        });
      }

      const exportCanvas = document.createElement('canvas');
      renderCardToCanvas(exportCanvas, true);

      const dataUrl = exportCanvas.toDataURL('image/png');
      setDownloadedCardUrl(dataUrl);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337']
      });

      const cleanFilename = (studentName || "Alumni").replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Star_Matric_ID_Card_${cleanFilename}.png`;

      exportCanvas.toBlob((blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Record tracking in context
        recordCardGenerated(studentName || "Classmate", 'idcard');
        setIsExporting(false);
      }, 'image/png');

    } catch (err) {
      setIsExporting(false);
      setUploadError("Failed to render card for download. Please try again.");
    }
  };

  // WhatsApp Web Share API Level 2 or Link Fallback
  const handleShareWhatsApp = async () => {
    sound.playPop();

    if (navigator.share) {
      try {
        const exportCanvas = document.createElement('canvas');
        renderCardToCanvas(exportCanvas, true);

        exportCanvas.toBlob(async (blob) => {
          if (blob && navigator.canShare) {
            const cleanFilename = (studentName || "Alumni").replace(/[^a-zA-Z0-9_-]/g, '_');
            const filename = `Star_Matric_ID_Card_${cleanFilename}.png`;
            const file = new File([blob], filename, { type: 'image/png' });

            if (navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: `${REUNION_CONFIG.schoolName} School ID Card`,
                  text: `Here is my official STAR School ID Card for our Reunion on 27 December 2026! Generate yours here: ${window.location.origin}`
                });
                return;
              } catch (e) {}
            }
          }
          openWhatsAppTextShare();
        }, 'image/png');
        return;
      } catch (err) {}
    }

    openWhatsAppTextShare();
  };

  const openWhatsAppTextShare = () => {
    const siteUrl = window.location.origin;
    const shareText = `Check out my official STAR School ID Card for our School Friends Reunion 2026 (${REUNION_CONFIG.schoolName})!\n\nGenerate your own ID card and register here: ${siteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <section id="memory-card" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 relative w-full overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E9B95B]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* 1. Header from Prompt */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-xs font-bold uppercase tracking-wider text-[#594337] border border-[#F0E1CE]">
          <Camera className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Star School ID Card Studio</span>
        </div>

        {/* Heading from Prompt */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase">
          TAKE A PIECE OF OUR MEMORIES WITH YOU
        </h2>

        {/* Supporting text from Prompt */}
        <p className="text-sm sm:text-base text-[#927B6C] max-w-2xl mx-auto leading-relaxed font-semibold">
          Your school memories deserve to be remembered. Generate your official STAR MATRIC HR SEC SCHOOL ID card and download it.
        </p>
      </div>

      {/* 2. Interactive Studio Grid: Preview on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* LEFT COLUMN: LIVE ID CARD CANVAS PREVIEW */}
        <div className="lg:col-span-5 order-1 lg:order-1 flex flex-col items-center">
          <div className="clay-card p-4 sm:p-6 bg-[#FFFFFF] border-2 border-[#F0E1CE] w-full max-w-[420px] mx-auto text-center space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE]">
              <div className="flex items-center space-x-2 text-xs font-black uppercase text-[#594337]">
                <Sparkles className="w-4 h-4 text-[#E9B95B]" />
                <span>Original ID Card Live Preview</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E9B95B]/20 text-[#594337] border border-[#E9B95B]/40">
                776 × 1024
              </span>
            </div>

            {/* Interactive Canvas Stage */}
            <div 
              className="relative inline-block mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FFF5E8] bg-[#FFF5E8] cursor-grab active:cursor-grabbing select-none group"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              title="Click and drag to position your photo"
            >
              <canvas
                ref={previewCanvasRef}
                className="w-full max-w-[340px] sm:max-w-[370px] h-auto block rounded-xl"
              />

              {photoImg && (
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#594337]/90 text-[#FFF5E8] text-[10px] font-bold flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Move className="w-3 h-3 text-[#E9B95B]" />
                  <span>Drag to pan photo</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#927B6C] font-semibold">
              {photoImg 
                ? "💡 Drag directly on the card above to reposition your photo." 
                : "Upload your student photo on the right to place it in the portrait frame."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & PHOTO ADJUSTMENTS */}
        <div className="lg:col-span-7 order-2 lg:order-2 space-y-6">
          
          {/* Card 1: Student Information */}
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#F0E1CE] space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#F0E1CE]">
              <User className="w-4 h-4 text-[#E9B95B]" />
              <h3 className="font-bold text-sm text-[#594337] uppercase tracking-wider">
                1. Student Details on ID Card
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#927B6C] mb-1.5">
                  Student Full Name:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#927B6C] mb-1.5">
                  Standard / Section (Std):
                </label>
                <input
                  type="text"
                  value={studentBatch}
                  onChange={(e) => setStudentBatch(e.target.value)}
                  placeholder="e.g. XII - A"
                  className="w-full px-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                />
              </div>
            </div>

            {/* Quick prefill from registered classmates */}
            {registrations.length > 0 && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-[#927B6C] mb-1">
                  Or select registered student:
                </label>
                <select
                  onChange={(e) => {
                    const selected = registrations.find(r => r.name === e.target.value);
                    if (selected) {
                      setStudentName(selected.name);
                      if (selected.batch) setStudentBatch(selected.batch);
                      if (selected.photo_url) loadPhotoFromUrl(selected.photo_url);
                    }
                  }}
                  className="w-full px-3 py-2 clay-input text-xs font-semibold text-[#594337] bg-[#FFFDF9]"
                  defaultValue=""
                >
                  <option value="" disabled className="bg-[#FFFFFF] text-[#594337]">Choose from registered classmates ({registrations.length} students)...</option>
                  {registrations.map(r => (
                    <option key={r.id || r.phone} value={r.name} className="bg-[#FFFFFF] text-[#594337]">{r.name} ({r.batch || 'XII'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Card 2: Photo Upload & Positioning */}
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#F0E1CE] space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE]">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#E9B95B]" />
                <h3 className="font-bold text-sm text-[#594337] uppercase tracking-wider">
                  2. Upload Student Photograph
                </h3>
              </div>
              {photoSrc && (
                <button
                  onClick={handleRemovePhoto}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl clay-surface-cream border-2 border-dashed border-[#E9B95B] hover:border-[#D99F37] cursor-pointer text-center space-y-2 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={onFileInputChange}
              />
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#E9B95B] group-hover:scale-110 flex items-center justify-center mx-auto shadow-sm transition border border-[#F0E1CE]">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#594337]">
                {photoSrc ? "Click or drag to replace photo" : "Click to select or drag photo here"}
              </div>
              <div className="text-[11px] text-[#927B6C]">
                Supports JPG, JPEG, PNG, WebP (Max 10MB) • Preserved in high resolution
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Photo Adjustments (Zoom & Reset) */}
            {photoSrc && (
              <div className="space-y-4 pt-2 border-t border-[#F0E1CE]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#594337] uppercase">
                    Photo Adjustments
                  </span>
                  <button
                    onClick={handleResetAdjustments}
                    className="text-xs font-medium text-[#927B6C] hover:text-[#594337] flex items-center space-x-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Zoom Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-[#927B6C]">
                    <span className="flex items-center space-x-1">
                      <ZoomOut className="w-3.5 h-3.5" />
                      <span>Zoom / Scale:</span>
                    </span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#E9B95B] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: School Branding Confirmation */}
          <div className="clay-card p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#F0E1CE] flex items-center space-x-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF5E8] border border-[#F0E1CE] text-[#E9B95B] flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
              🎓
            </div>
            <div>
              <div className="text-xs font-black uppercase text-[#594337] tracking-wider flex items-center space-x-1.5">
                <span>Official STAR MATRIC HR SEC SCHOOL ID Card</span>
                <span className="text-[#E9B95B]">★</span>
              </div>
              <div className="text-[11px] text-[#927B6C] font-semibold mt-0.5">
                Preserving original yellow layout, school crest, building photo & signature
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="clay-surface-cream p-4 rounded-2xl border border-[#F0E1CE] flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="photoConsent"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 accent-[#E9B95B] rounded"
            />
            <label htmlFor="photoConsent" className="text-xs text-[#927B6C] leading-relaxed cursor-pointer select-none">
              I confirm this is my photograph and details for the official Star School ID Card.
            </label>
          </div>

          {/* ACTION BUTTONS (Download & Share) */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="w-full py-4 px-6 rounded-[22px] clay-button-gold text-base font-bold flex items-center justify-center space-x-2.5 disabled:opacity-50 transition text-[#413027]"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#413027]" />
                  <span>Generating High-Quality PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-[#413027]" />
                  <span>DOWNLOAD STAR SCHOOL ID CARD (PNG)</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3.5 px-6 rounded-[22px] clay-button text-sm font-bold text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]"
            >
              <Share2 className="w-4 h-4 text-[#E9B95B]" />
              <span>Share on WhatsApp</span>
            </button>
          </div>

          {/* DOWNLOADED CARD DISPLAY & VIEW */}
          <AnimatePresence>
            {downloadedCardUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="clay-card p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#E9B95B] rounded-[28px] text-center space-y-5 shadow-xl"
              >
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>ID Card Downloaded Successfully!</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-[#594337]">
                    Official STAR School ID Card
                  </h3>
                  <p className="text-xs text-[#927B6C] font-medium">
                    Saved directly to your device downloads folder
                  </p>
                </div>

                {/* Rendered Card Image Display */}
                <div className="relative inline-block mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FFF5E8] max-w-[280px]">
                  <img
                    src={downloadedCardUrl}
                    alt="Your Generated STAR School ID Card"
                    className="w-full h-auto block rounded-xl cursor-pointer hover:opacity-95 transition"
                    onClick={() => setIsViewModalOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(true)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#594337]/90 text-[#FFF5E8] text-[11px] font-bold flex items-center space-x-1 shadow-md hover:scale-105 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#E9B95B]" />
                    <span>View Full Size</span>
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadPNG}
                    className="w-full sm:w-auto px-6 py-3 rounded-[18px] clay-button-gold text-xs font-bold flex items-center justify-center space-x-2 text-[#413027]"
                  >
                    <Download className="w-4 h-4 text-[#413027]" />
                    <span>Download Again</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full sm:w-auto px-6 py-3 rounded-[18px] clay-button text-xs font-bold text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]"
                  >
                    <Share2 className="w-4 h-4 text-[#E9B95B]" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Full Size Modal Lightbox */}
      <AnimatePresence>
        {isViewModalOpen && downloadedCardUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsViewModalOpen(false)}
            className="fixed inset-0 z-50 bg-[#594337]/60 backdrop-blur-md flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-[#FFFFFF] p-6 rounded-[28px] border-2 border-[#F0E1CE] shadow-2xl text-center space-y-4"
            >
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full clay-button text-[#594337] hover:text-rose-600 border border-[#F0E1CE]"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-base font-bold text-[#594337]">
                STAR School ID Card (Official Keepsake)
              </h4>

              <div className="rounded-2xl overflow-hidden shadow-inner max-h-[75vh] flex items-center justify-center bg-[#FFF5E8]">
                <img
                  src={downloadedCardUrl}
                  alt="STAR School ID Card"
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleDownloadPNG}
                  className="px-6 py-2.5 rounded-[18px] clay-button-gold text-xs font-bold flex items-center space-x-1.5 text-[#413027]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2.5 rounded-[18px] clay-button text-xs font-semibold text-[#927B6C] border border-[#F0E1CE]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};