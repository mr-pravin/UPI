import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { TreePine, RefreshCw, Cat, Zap, TrendingDown } from "lucide-react";

const models = [
  { icon: TreePine, name: "Random Forest", desc: "Ensemble of 100 decision trees, handles imbalanced data", accuracy: "96.2%" },
  { icon: RefreshCw, name: "AdaBoost", desc: "Adaptive boosting, focuses on misclassified samples", accuracy: "94.8%" },
  { icon: Cat, name: "CatBoost", desc: "Gradient boosting with categorical feature support", accuracy: "97.1%" },
  { icon: Zap, name: "LightGBM", desc: "Light Gradient Boosting, calibrated with CalibratedClassifierCV", accuracy: "97.5%" },
  { icon: TrendingDown, name: "Logistic Regression", desc: "Baseline probabilistic classifier", accuracy: "92.3%" },
];

const ModelsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-display font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          ML Models <span className="glow-text-purple">Ensemble</span>
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {models.map((m, i) => (
            <motion.div
              key={m.name}
              className="glass-card-hover p-6 text-center group cursor-default"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, rotateX: 5, rotateY: -5 }}
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            >
              <m.icon className="w-10 h-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-display text-sm font-semibold mb-2">{m.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{m.desc}</p>
              <span className="inline-block text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {m.accuracy}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModelsSection;
