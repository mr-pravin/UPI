import { predictTransaction, type PredictionResult } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Loader2, Shield } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useInView } from "react-intersection-observer";

const PLACEHOLDER = `-0.208,1.072,-0.281,1.188,1.739,-0.848,0.564,-0.633,0.371,1.484,-0.372,-1.370,0.161,-1.810,-0.434,-1.533,-1.073,0.862,-1.163,0.183,-0.301,-0.431,-0.847,0.100,0.039,0.372,-0.504,0.080,0.026,548.72`;

/**
 * Generate demo prediction when backend is unavailable
 */
function generateDemoPrediction(features: number[]): PredictionResult {
  const v1Value = features[1] ?? 0;
  const isFraud = v1Value < -1.5;

  if (isFraud) {
    const confidence = 0.89 + Math.random() * 0.08;
    return {
      is_fraud: true,
      confidence: parseFloat(confidence.toFixed(4)),
      risk_level: 'HIGH',
      probability: parseFloat(confidence.toFixed(4)),
      message: 'Transaction flagged as potential fraud',
      isDemoMode: true,
    };
  }

  const confidence = 0.91 + Math.random() * 0.08;
  return {
    is_fraud: false,
    confidence: parseFloat(confidence.toFixed(4)),
    risk_level: 'LOW',
    probability: 1 - parseFloat(confidence.toFixed(4)),
    message: 'Transaction appears legitimate',
    isDemoMode: true,
  };
}

export interface PredictionRef {
  setInput: (val: string) => void;
  triggerPrediction?: () => void;
}

const PredictionEngine = forwardRef<PredictionRef>((_props, fRef) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | PredictionResult>(null);
  const [error, setError] = useState<string | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useImperativeHandle(fRef, () => ({
    setInput,
    triggerPrediction: analyze,
  }));

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Parse and validate input
    const trimmed = input.trim().replace(/,+/g, ',');
    if (!trimmed) {
      setError('Please enter transaction values');
      setLoading(false);
      return;
    }

    const valueStrings = trimmed.split(',').map(s => s.trim()).filter(s => s !== '');
    if (valueStrings.length !== 30) {
      setError(`Expected 30 values, got ${valueStrings.length}. Check your input.`);
      setLoading(false);
      return;
    }

    const values = valueStrings.map(v => Number(v));
    if (values.some(v => isNaN(v))) {
      setError('All values must be valid numbers. Check for invalid characters.');
      setLoading(false);
      return;
    }

    // Try real backend first — NO health check blocker
    try {
      const response = await predictTransaction(values);
      setResult({
        is_fraud: response.is_fraud,
        confidence: response.confidence,
        probability: response.probability,
        risk_level: response.risk_level,
        message: response.is_fraud
          ? 'Transaction flagged as fraudulent'
          : 'Transaction appears legitimate',
        isDemoMode: false
      });
      setLoading(false);
      return;
    } catch (backendError) {
      console.warn('Backend unavailable, using demo mode:', backendError);
    }

    // Demo fallback ONLY when backend is truly unreachable
    const v1Value = values[1];
    const fraudDemo = v1Value < -1.0;
    setResult({
      is_fraud: fraudDemo,
      confidence: fraudDemo ? 0.942 : 0.978,
      probability: fraudDemo ? 0.942 : 0.022,
      risk_level: fraudDemo ? 'HIGH' : 'LOW',
      message: fraudDemo
        ? 'Transaction flagged as potential fraud'
        : 'Transaction appears legitimate',
      isDemoMode: true
    });
    setLoading(false);
  }, [input]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-success";
      case "MEDIUM":
        return "text-amber-500";
      case "HIGH":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-success/10";
      case "MEDIUM":
        return "bg-amber-500/10";
      case "HIGH":
        return "bg-destructive/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <section id="prediction" ref={ref} className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-destructive/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-4">
            Live <span className="glow-text-blue">Fraud</span> Detection
          </h2>
          <div className="flex justify-center mb-12">
            <motion.div
              className="h-1 w-24 rounded-full bg-gradient-to-r from-primary via-accent to-destructive"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="glass-card p-6 md:p-8">
            <label className="block text-sm font-display text-muted-foreground mb-3 tracking-wider uppercase">
              Paste transaction features (30 values)
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder={PLACEHOLDER}
              rows={4}
              className="w-full bg-background/50 border border-border rounded-lg p-4 text-sm font-mono text-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter exactly 30 comma-separated values: Time, V1–V28, Amount.
            </p>

            <div className="mt-6 text-center">
              <button
                onClick={analyze}
                disabled={loading || !input.trim()}
                className="btn-primary-glow font-display text-sm tracking-wider disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden min-w-[200px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  "⚡ Analyze Transaction"
                )}
                {loading && (
                  <motion.div
                    className="absolute inset-0 border-2 border-primary/50 rounded-lg"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      borderTopColor: "transparent",
                      borderRightColor: "transparent",
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="mt-8 glass-card p-6 text-center border border-destructive/20 glow-border-red"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="text-lg font-display text-destructive mb-2">
                  Error
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                className={`mt-8 glass-card p-8 text-center ${result.is_fraud ? "glow-border-red" : "glow-border-green"
                  }`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                {result?.isDemoMode && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600">
                    ⚡ Demo Mode — Connect backend for live predictions
                  </div>
                )}

                {result.is_fraud ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4 drop-shadow-[0_0_20px_hsla(0,84%,60%,0.5)]" />
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-destructive mb-2">
                      🚨 FRAUD DETECTED
                    </h3>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: "spring" }}
                    >
                      <Shield className="w-16 h-16 text-success mx-auto mb-4 drop-shadow-[0_0_20px_hsla(142,76%,46%,0.5)]" />
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-success mb-2">
                      ✅ TRANSACTION LEGITIMATE
                    </h3>
                  </>
                )}

                <p className="text-muted-foreground mb-3">
                  {result.isDemoMode
                    ? `${result.message} (Demo Mode)`
                    : result.message
                  }
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2">
                      Confidence:{" "}
                      <span className="font-mono font-bold text-foreground">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1 font-mono">
                        <span>0%</span>
                        <span className="text-muted-foreground/70">
                          Fraud Probability
                        </span>
                        <span>100%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${result.is_fraud
                            ? "bg-gradient-to-r from-destructive/80 to-destructive"
                            : "bg-gradient-to-r from-success/80 to-success"
                            }`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${result.is_fraud
                              ? result.confidence * 100
                              : (1 - result.confidence) * 100
                              }%`,
                          }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Risk Level
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskBgColor(
                        result.risk_level
                      )} ${getRiskColor(result.risk_level)}`}
                    >
                      {result.risk_level}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
});

PredictionEngine.displayName = "PredictionEngine";

export default PredictionEngine;
