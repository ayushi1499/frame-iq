import { useState, useRef } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { ImageUploader } from "@/components/image-uploader";
import { useRecognizeFace, useRegisterFace } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, UserCheck, AlertTriangle, CheckCircle2, Camera, Video, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Recognition() {
  const [activeTab, setActiveTab] = useState("recognize");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const recognizeMutation = useRecognizeFace();
  const registerMutation = useRegisterFace();

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
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please allow camera permissions.",
        variant: "destructive",
      });
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
            if (activeTab === "recognize") {
              recognizeMutation.mutate(file, {
                onError: (err) => {
                  toast({ title: "Recognition Failed", description: err.message, variant: "destructive" });
                }
              });
            }
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleImageSelect = (file: File | null) => {
    setImage(file);
    if (!file) setImagePreview(null);
  };

  const clearCapture = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleRecognize = () => {
    if (!image) return;
    recognizeMutation.mutate(image, {
      onError: (err) => {
        toast({ title: "Recognition Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleRegister = () => {
    if (!image || !name) return;
    registerMutation.mutate({ name, image }, {
      onSuccess: () => {
        toast({ title: "Face Registered!", description: `${name} has been saved successfully.` });
        setName("");
        setImage(null);
        setImagePreview(null);
      },
      onError: (err) => {
        toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Face Recognition</h1>
        <p className="text-sm text-muted-foreground mt-1">Identify or register faces using your camera</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4" data-testid="recognition-tabs">
          <TabsTrigger value="recognize" data-testid="tab-recognize">
            Recognize
          </TabsTrigger>
          <TabsTrigger value="register" data-testid="tab-register">
            Register New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recognize" className="space-y-3 mt-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <AnimatePresence mode="wait">
                {showLiveCamera ? (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
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
                        <Button
                          size="lg"
                          onClick={capturePhoto}
                          data-testid="button-capture"
                        >
                          <Camera className="w-5 h-5 mr-1" />
                          Capture
                        </Button>
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={stopCamera}
                        >
                          <X className="w-5 h-5 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : imagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <div className="rounded-md overflow-hidden">
                      <img src={imagePreview} alt="Captured" className="w-full aspect-[3/4] object-cover" />
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 z-10"
                      onClick={clearCapture}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="uploader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ImageUploader onImageSelect={handleImageSelect} label="Upload Face to Recognize" />
                  </motion.div>
                )}
              </AnimatePresence>

              {!showLiveCamera && !imagePreview && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={startCamera}
                  data-testid="button-live-camera"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Use Live Camera
                </Button>
              )}

              {!showLiveCamera && (
                <Button
                  className="w-full"
                  disabled={!image || recognizeMutation.isPending}
                  onClick={handleRecognize}
                  data-testid="button-identify"
                >
                  {recognizeMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Identifying...</>
                  ) : (
                    "Identify Face"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <AnimatePresence>
            {recognizeMutation.data && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-0.5">All Matches</p>
                {recognizeMutation.data.all_matches.map((match, index) => (
                  <motion.div
                    key={match.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card className={index === 0 ? "ring-1 ring-emerald-500/40" : ""}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0 ${index === 0 ? "ring-2 ring-emerald-500/40" : ""}`}>
                          {match.face_image ? (
                            <img
                              src={match.face_image}
                              alt={match.name}
                              className="w-full h-full object-cover"
                              data-testid={`img-match-face-${index}`}
                            />
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">{match.name[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground" data-testid={`text-match-name-${index}`}>{match.name}</p>
                            {index === 0 && (
                              <span className="text-[10px] font-medium bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">Best</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{match.confidence.toFixed(1)}% Match</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {recognizeMutation.error && !recognizeMutation.isPending && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <AlertTriangle className="w-8 h-8 text-destructive mb-2" />
                    <p className="font-semibold text-foreground mb-1">No Match Found</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Try registering this face first.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("register")}>
                      Register Face
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="register" className="space-y-3 mt-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <AnimatePresence mode="wait">
                {showLiveCamera ? (
                  <motion.div
                    key="reg-camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
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
                        <Button size="lg" onClick={capturePhoto} data-testid="button-capture-register">
                          <Camera className="w-5 h-5 mr-1" /> Capture
                        </Button>
                        <Button variant="destructive" size="lg" onClick={stopCamera}>
                          <X className="w-5 h-5 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : imagePreview ? (
                  <motion.div
                    key="reg-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <div className="rounded-md overflow-hidden">
                      <img src={imagePreview} alt="Captured" className="w-full aspect-[3/4] object-cover" />
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 z-10"
                      onClick={clearCapture}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reg-uploader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ImageUploader onImageSelect={handleImageSelect} label="Upload Face to Register" />
                  </motion.div>
                )}
              </AnimatePresence>

              {!showLiveCamera && !imagePreview && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={startCamera}
                  data-testid="button-register-camera"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Use Live Camera
                </Button>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-0.5">Name</label>
                <Input
                  placeholder="Enter person's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-register-name"
                />
              </div>

              <Button
                className="w-full"
                disabled={!image || !name || registerMutation.isPending}
                onClick={handleRegister}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</>
                ) : (
                  "Register Face"
                )}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {registerMutation.isSuccess && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Registration Complete</p>
                        <p className="text-sm text-muted-foreground">{registerMutation.data.name} saved to database</p>
                      </div>
                    </div>
                    {registerMutation.data.preview_image && (
                      <div className="mt-3 rounded-md overflow-hidden">
                        <img src={registerMutation.data.preview_image} alt="Preview" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}
