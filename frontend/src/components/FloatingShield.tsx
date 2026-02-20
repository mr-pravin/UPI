import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const FloatingShield = () => (
  <motion.div
    className="relative"
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full animate-pulse-glow" />
      <motion.div
        className="absolute -inset-4 rounded-full border border-primary/20"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute -inset-8 rounded-full border border-accent/10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      {/* Shield icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary drop-shadow-[0_0_20px_hsla(190,100%,50%,0.5)]" strokeWidth={1.5} />
      </div>
    </div>
  </motion.div>
);

export default FloatingShield;
