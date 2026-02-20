import { motion } from "framer-motion";
import { BookOpen, FileText } from "lucide-react";
import { useInView } from "react-intersection-observer";

const DocumentationSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const handleProjectLetterDownload = () => {
    const link = document.createElement('a');
    link.href = '/pravin-project-letter.pdf';
    link.target = '_blank';
    link.download = 'PRAVIN-PROJECT-LETTER.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNotebookDownload = () => {
    const link = document.createElement('a');
    link.href = '/UPI-FRAUD-DETECTION.ipynb';
    link.download = 'UPI-FRAUD-DETECTION.ipynb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReportOpen = () => {
    window.open('/upi-fraud-detection-report.pdf', '_blank');
  };

  const cards = [
    {
      icon: FileText,
      title: "Project Letter",
      label: "PRAVIN PROJECT LETTER.pdf",
      action: "DOWNLOAD PDF",
      onClick: handleProjectLetterDownload,
    },
    {
      icon: BookOpen,
      title: "Jupyter Notebook",
      label: "UPI-FRAUD-DETECTION.ipynb",
      action: "DOWNLOAD NOTEBOOK",
      onClick: handleNotebookDownload,
    },
    {
      icon: FileText,
      title: "Project Report",
      label: "UPI-Fraud-Detection.pdf",
      action: "VIEW REPORT",
      onClick: handleReportOpen,
    },
  ];

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-display font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          Documentation & <span className="glow-text-blue">Resources</span>
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.button
              key={c.title}
              onClick={c.onClick}
              className="glass-card-hover p-6 text-center group block w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <c.icon className="w-10 h-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-display text-sm font-semibold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4">{c.label}</p>
              <span className="text-xs text-primary font-display tracking-wider uppercase">{c.action} →</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentationSection;
