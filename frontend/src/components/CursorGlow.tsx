import { useEffect, useState } from "react";

const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return <div className="cursor-glow hidden md:block" style={{ left: pos.x, top: pos.y }} />;
};

export default CursorGlow;
