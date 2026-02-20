import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

interface StatItem {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}

const stats: StatItem[] = [
  { icon: "🎯", value: 98.3, suffix: "%", label: "ROC-AUC Score", decimals: 1 },
  { icon: "📊", value: 87.7, suffix: "%", label: "PR-AUC Score", decimals: 1 },
  { icon: "⚡", value: 85.4, suffix: "%", label: "F1 Score", decimals: 1 },
  { icon: "🔍", value: 284807, suffix: "", label: "Transactions Analyzed", decimals: 0 },
  { icon: "🛡️", value: 0.17, suffix: "%", label: "Fraud Rate Detected", decimals: 2 },
  { icon: "🤖", value: 5, suffix: "", label: "ML Models Ensemble", decimals: 0 },
];

const AnimatedCounter = ({ target, decimals, inView }: { target: number; decimals: number; inView: boolean }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span className="font-mono">{val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
};

const StatsBar = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section ref={ref} className="relative py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-card p-4 md:p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl md:text-3xl font-display font-bold glow-text-blue">
              <AnimatedCounter target={stat.value} decimals={stat.decimals ?? 0} inView={inView} />
              {stat.suffix}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
