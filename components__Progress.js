'use client';
import { motion, useScroll, useSpring } from 'framer-motion';
export default function Progress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div className="prog" style={{ scaleX: x }} />;
}
