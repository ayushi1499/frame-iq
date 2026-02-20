import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { ImageUploader } from "@/components/image-uploader";
import { useAnalyzeFace } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Smile, User, Globe, Baby, Camera, Video, X, Lightbulb, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { SiX, SiFacebook, SiWhatsapp, SiLinkedin } from "react-icons/si";

export default function Analysis() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [showFunFacts, setShowFunFacts] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useAnalyzeFace();

  useEffect(() => {
    if (analyzeMutation.data) {
      setShowFunFacts(false);
    }
  }, [analyzeMutation.data]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setShowLiveCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast({ title: "Camera Error", description: "Could not access camera", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowLiveCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const previewUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(previewUrl);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setImage(file);
            stopCamera();
            analyzeMutation.mutate(file);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleImageSelect = (file: File | null) => {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    analyzeMutation.mutate(image);
  };

  const faceFacts = analyzeMutation.data?.fun_facts || [];

  const getShareText = () => {
    if (!analyzeMutation.data) return "";
    const d = analyzeMutation.data;
    return `Face Analysis Results from Frame IQ:\nAge: ${d.age} years\nGender: ${d.gender}\nEmotion: ${d.emotion}\nEthnicity: ${d.ethnicity}\n\nAnalyzed with Frame IQ`;
  };

  const handleShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Face Analysis Results", text });
        toast({ title: "Shared successfully!" });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast({ title: "Sharing failed", variant: "destructive" });
        }
      }
    } else {
      handleShareTo("copy");
    }
  };

  const handleShareTo = (platform: string) => {
    const text = getShareText();
    const encoded = encodeURIComponent(text);
    const url = encodeURIComponent(window.location.href);

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}&u=${url}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(text);
        toast({ title: "Results copied to clipboard!" });
        break;
    }
  };

  const attributes = analyzeMutation.data ? [
    { icon: Baby, label: "Age", value: `${analyzeMutation.data.age} years`, score: 100 },
    { icon: User, label: "Gender", value: analyzeMutation.data.gender, score: analyzeMutation.data.confidence_scores.gender_pct },
    { icon: Smile, label: "Emotion", value: analyzeMutation.data.emotion, score: analyzeMutation.data.confidence_scores.emotion_pct },
    { icon: Globe, label: "Ethnicity", value: analyzeMutation.data.ethnicity, score: analyzeMutation.data.confidence_scores.ethnicity_pct },
  ] : [];

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Face Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered age, gender & emotion detection</p>
      </header>

      <div className="space-y-3">
        <Card>
          <CardContent className="p-4 space-y-3">
            {showLiveCamera ? (
              <div className="relative">
                <div className="rounded-md overflow-hidden bg-black aspect-[3/4]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3 z-10 rounded-b-md">
                  <Button size="lg" onClick={capturePhoto} data-testid="button-capture-analysis">
                    <Camera className="w-5 h-5 mr-1" /> Capture
                  </Button>
                  <Button variant="destructive" size="lg" onClick={stopCamera}>
                    <X className="w-5 h-5 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {imagePreview ? (
                  <div className="relative">
                    <div className="rounded-md overflow-hidden bg-black aspect-[3/4]">
                      <img
                        src={imagePreview}
                        alt="Selected photo"
                        className="w-full h-full object-cover"
                        data-testid="img-photo-preview"
                      />
                    </div>
                    {analyzeMutation.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                          <span className="text-sm text-white font-medium">Analyzing...</span>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        handleImageSelect(null);
                        analyzeMutation.reset();
                      }}
                      data-testid="button-clear-photo"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <ImageUploader onImageSelect={handleImageSelect} label="Upload Photo to Analyze" />
                )}
                {!imagePreview && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={startCamera}
                    data-testid="button-analysis-camera"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Use Live Camera
                  </Button>
                )}
              </>
            )}

            {!showLiveCamera && !analyzeMutation.isPending && image && !analyzeMutation.data && (
              <Button
                className="w-full"
                onClick={handleAnalyze}
                data-testid="button-analyze"
              >
                Analyze Attributes
              </Button>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {analyzeMutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 ml-0.5">Results</p>
              {attributes.map((attr, index) => (
                <motion.div
                  key={attr.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <attr.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{attr.label}</p>
                        <p className="text-sm font-semibold text-foreground capitalize" data-testid={`text-${attr.label.toLowerCase()}`}>{attr.value}</p>
                        {attr.score < 100 && (
                          <div className="mt-1 flex items-center gap-2">
                            <Progress value={attr.score} className="h-1 flex-1" />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">{attr.score.toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {showFunFacts ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Fun Facts About This Face
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => setShowFunFacts(false)}
                          data-testid="button-hide-fun-facts"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {faceFacts.map((fact, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-3"
                          >
                            <span className="w-6 h-6 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-fun-fact-${i}`}>
                              {fact}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowFunFacts(true)}
                    data-testid="button-show-fun-facts"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Fun Facts About This Face
                  </Button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share Results</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        data-testid="button-share"
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        Share
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareTo("twitter")}
                        data-testid="button-share-twitter"
                      >
                        <SiX className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareTo("facebook")}
                        data-testid="button-share-facebook"
                      >
                        <SiFacebook className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareTo("whatsapp")}
                        data-testid="button-share-whatsapp"
                      >
                        <SiWhatsapp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareTo("linkedin")}
                        data-testid="button-share-linkedin"
                      >
                        <SiLinkedin className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {analyzeMutation.error && !analyzeMutation.isPending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="font-semibold text-foreground mb-1">Analysis Failed</p>
                  <p className="text-sm text-muted-foreground">Please try again with a clearer photo.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
