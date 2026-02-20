import { fraudSamples, validSamples } from "@/data/sampleData";
import { motion } from "framer-motion";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
  onLoadSample: (data: string) => void;
}

const SamplePanel = ({
  title,
  samples,
  isFraud,
  onLoad,
  inView,
}: {
  title: string;
  samples: Array<{ id: number; type: 'valid' | 'fraud'; values: string; label: string }>;
  isFraud: boolean;
  onLoad: (s: string) => void;
  inView: boolean;
}) => (
  <div className="glass-card p-4 md:p-6 overflow-hidden">
    <h3 className="font-display text-lg font-semibold mb-4">{title}</h3>
    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
      {samples.map((sample, i) => {
        const preview = sample.values.split(",").slice(0, 4).join(", ") + "...";
        return (
          <motion.div
            key={sample.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-background/30 hover:bg-background/60 transition-colors text-sm group"
            initial={{ opacity: 0, x: isFraud ? 20 : -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.03, duration: 0.4 }}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isFraud ? "bg-destructive shadow-[0_0_6px_hsla(0,84%,60%,0.5)]" : "bg-success shadow-[0_0_6px_hsla(142,76%,46%,0.5)]"}`} />
            <span className="text-xs text-muted-foreground flex-shrink-0">#{sample.id}</span>
            <span className="font-mono text-xs text-muted-foreground truncate flex-1">{preview}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${isFraud ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
              {sample.label}
            </span>
            <button
              onClick={() => {
                onLoad(sample.values);
                document.getElementById("prediction")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
            >
              Load
            </button>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const SampleDataSection = ({ onLoadSample }: Props) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<'valid' | 'fraud'>('valid');

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-display font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          Sample <span className="glow-text-blue">Transactions</span>
        </motion.h2>

        {/* Tab Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('valid')}
            className={`px-6 py-2 rounded-lg font-display font-semibold transition-all ${activeTab === 'valid'
                ? 'bg-success/20 text-success border border-success/30'
                : 'bg-background/50 text-muted-foreground border border-border hover:border-success/30'
              }`}
          >
            ✅ Valid ({validSamples.length})
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-6 py-2 rounded-lg font-display font-semibold transition-all ${activeTab === 'fraud'
                ? 'bg-destructive/20 text-destructive border border-destructive/30'
                : 'bg-background/50 text-muted-foreground border border-border hover:border-destructive/30'
              }`}
          >
            🚨 Fraud ({fraudSamples.length})
          </button>
        </div>

        {/* Sample Panel */}
        <div className="grid md:grid-cols-1 gap-6">
          {activeTab === 'valid' ? (
            <SamplePanel
              title={`Valid Transactions (${validSamples.length} samples)`}
              samples={validSamples}
              isFraud={false}
              onLoad={onLoadSample}
              inView={inView}
            />
          ) : (
            <SamplePanel
              title={`Fraud Transactions (${fraudSamples.length} samples)`}
              samples={fraudSamples}
              isFraud={true}
              onLoad={onLoadSample}
              inView={inView}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default SampleDataSection;
