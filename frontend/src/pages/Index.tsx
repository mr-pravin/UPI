import CursorGlow from "@/components/CursorGlow";
import DocumentationSection from "@/components/DocumentationSection";
import FooterSection from "@/components/FooterSection";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ModelsSection from "@/components/ModelsSection";
import PredictionEngine, { type PredictionRef } from "@/components/PredictionEngine";
import SampleDataSection from "@/components/SampleDataSection";
import StatsBar from "@/components/StatsBar";
import { useRef } from "react";

const Index = () => {
  const predRef = useRef<PredictionRef>(null);

  const handleLoadSample = (data: string) => {
    predRef.current?.setInput(data);
    // Auto-trigger prediction after setting input
    setTimeout(() => {
      predRef.current?.triggerPrediction?.();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CursorGlow />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <PredictionEngine ref={predRef} />
      <SampleDataSection onLoadSample={handleLoadSample} />
      <ModelsSection />
      <DocumentationSection />
      <FooterSection />
    </div>
  );
};

export default Index;
