import { useEffect, useState } from "react";

interface Props {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}

const TypewriterText = ({ text, speed = 60, className = "", onDone }: Props) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
};

export default TypewriterText;
