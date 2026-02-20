import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ClipboardPaste, Brain, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardPaste,
    title: "Input Transaction",
    desc: "Paste 30 feature values from a UPI transaction for analysis",
    color: "text-primary",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    desc: "5 ensemble ML models analyze the transaction in real-time",
    color: "glow-text-purple",
  },
  {
    icon: ShieldCheck,
    title: "Instant Result",
    desc: "Get fraud or legitimate verdict with confidence score",
    color: "text-success",
  },
];

const HowItWorks = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-display font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          How It <span className="glow-text-blue">Works</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="glass-card-hover p-8 text-center group"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              {/* Step number */}
              <div className="mt-4 w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center mx-auto text-xs font-display text-primary">
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
