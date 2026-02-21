import { motion } from "framer-motion";
import { Github, Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useInView } from "react-intersection-observer";

const socials = [
  { icon: Linkedin, href: "https://linkedin.com/in/mr-pravin", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/mr-pravin", label: "GitHub" },
  { icon: Globe, href: "https://mrpravin000.vercel.app", label: "Portfolio" },
];

const FooterSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <footer ref={ref} className="section-padding pb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent pointer-events-none" />
      <div className="max-w-2xl mx-auto relative">
        <motion.div
          className="glass-card p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Avatar - Real Photo */}
          <div className="w-24 h-24 mx-auto mb-6">
            <img
              src="/pravin-photo.jpeg"
              alt="Pravin MR"
              className="w-24 h-24 rounded-full object-cover object-top border-2 border-cyan-400 shadow-lg shadow-cyan-400/30"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <h3 className="font-display text-2xl font-bold mb-1 glow-text-blue">PRAVIN MR</h3>
          <p className="text-sm text-muted-foreground mb-6">MCA Student | ML Engineer</p>

          <div className="space-y-3 text-sm text-muted-foreground mb-8">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>+91 6380555595</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:mrpravin000@gmail.com" className="hover:text-primary transition-colors">mrpravin000@gmail.com</a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Chennai, India</span>
            </div>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4 mb-8">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_15px_hsla(190,100%,50%,0.3)]"
                aria-label={s.label}
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            SRM Institute of Science and Technology
          </p>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 Pravin MR. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
