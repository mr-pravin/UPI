import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import FloatingShield from "./FloatingShield";
import ParticleNetwork from "./ParticleNetwork";
import TypewriterText from "./TypewriterText";

const HeroSection = () => {
  const scrollToDemo = () => {
    document.getElementById("prediction")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleNetwork />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <FloatingShield />

          <h1 className="mt-8 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
            <TypewriterText text="Detecting Fraud." speed={70} />
            <br />
            <span className="glow-text-purple">
              <TypewriterText text="Protecting Trust." speed={70} />
            </span>
          </h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            AI-powered UPI transaction analysis using ensemble ML models
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <button onClick={scrollToDemo} className="btn-primary-glow font-display text-sm tracking-wider">
              Try Live Demo
            </button>
            <a
              href="https://github.com/mr-pravin/UPI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-glow font-display text-sm tracking-wider"
            >
              View on GitHub
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <ChevronDown className="w-8 h-8 text-primary/60 animate-bounce-arrow" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
