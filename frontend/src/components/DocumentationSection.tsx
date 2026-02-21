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
      onClick: () => {
        const link = document.createElement('a');
        link.href = '/pravin-project-letter.pdf';
        link.download = 'PRAVIN-PROJECT-LETTER.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      content: <span className="text-xs text-primary font-display tracking-wider uppercase">DOWNLOAD PDF →</span>
    },
    {
      icon: BookOpen,
      title: "Jupyter Notebook",
      label: "UPI-FRAUD-DETECTION.ipynb",
      content: (
        <div className="flex gap-2 justify-center mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); window.open('/UPI-FRAUD-DETECTION.html', '_blank'); }}
            className="text-xs text-primary font-display tracking-wider uppercase transition-colors hover:text-primary/70"
          >
            VIEW NOTEBOOK →
          </button>
          <span className="text-primary/30">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = '/UPI-FRAUD-DETECTION.ipynb';
              link.download = 'UPI-FRAUD-DETECTION.ipynb';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-xs text-primary font-display tracking-wider uppercase transition-colors hover:text-primary/70"
          >
            DOWNLOAD →
          </button>
        </div>
      )
    },
    {
      icon: FileText,
      title: "Project Report",
      label: "UPI-Fraud-Detection.pdf",
      onClick: () => window.open('/upi-fraud-detection-report.pdf', '_blank'),
      content: <span className="text-xs text-primary font-display tracking-wider uppercase">VIEW REPORT →</span>
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
            <motion.div
              key={c.title}
              onClick={c.onClick}
              className={`glass-card-hover p-6 text-center group block w-full flex flex-col ${c.onClick ? 'cursor-pointer' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <c.icon className="w-10 h-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-display text-sm font-semibold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4">{c.label}</p>
              <div className="mt-auto">
                {c.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentationSection;
