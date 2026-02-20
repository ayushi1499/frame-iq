import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useSummarize } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, AlignLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STYLE_OPTIONS = [
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "bullet-points", label: "Bullet Points" },
  { value: "simple", label: "Simple English" },
];

export default function Summarize() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("concise");
  const [length, setLength] = useState([100]);
  const [copied, setCopied] = useState(false);

  const summarizeMutation = useSummarize();
  const { toast } = useToast();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleSummarize = () => {
    if (!text.trim()) return;
    summarizeMutation.mutate({ text, style, max_length: length[0] });
  };

  const handleCopy = () => {
    if (summarizeMutation.data?.summary) {
      navigator.clipboard.writeText(summarizeMutation.data.summary);
      setCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setText("");
    summarizeMutation.reset();
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Summarizer</h1>
        <p className="text-sm text-muted-foreground mt-1">Condense any text with AI intelligence</p>
      </header>

      <div className="space-y-3">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Input Text
                </label>
                {wordCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {wordCount} words
                  </span>
                )}
              </div>
              <Textarea
                placeholder="Paste your text here... articles, essays, documents, or any long content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[140px] resize-none text-sm leading-relaxed"
                data-testid="input-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger data-testid="select-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex justify-between gap-1">
                  <span>Max Length</span>
                  <span className="text-foreground">{length[0]}w</span>
                </label>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  min={30}
                  max={300}
                  step={10}
                  className="py-4"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                className="flex-1"
                disabled={!text.trim() || summarizeMutation.isPending}
                onClick={handleSummarize}
                data-testid="button-summarize"
              >
                {summarizeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Summarizing...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Summarize</>
                )}
              </Button>
              {text.trim() && (
                <Button
                  variant="ghost"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {summarizeMutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground" data-testid="text-word-count">
                        {summarizeMutation.data.word_count} words
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopy}
                        data-testid="button-copy"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap leading-relaxed text-foreground text-sm" data-testid="text-summary">
                    {summarizeMutation.data.summary}
                  </p>

                  <div className="mt-3 pt-3 border-t flex justify-between items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="uppercase tracking-wider font-medium">{summarizeMutation.data.style}</span>
                    <span>{new Date(summarizeMutation.data.created_at).toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {summarizeMutation.error && !summarizeMutation.isPending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="font-semibold text-foreground mb-1">Summarization Failed</p>
                  <p className="text-sm text-muted-foreground">Please try again.</p>
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
