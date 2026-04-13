import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const typeImages = {
  reglamento:    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80',
  legal:         'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=900&q=80',
  curiosidades:  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80',
  agua_recursos: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80',
  seguridad:     'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&q=80',
  mantenimiento: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80',
  transparencia: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&q=80',
};

const typeConfig = {
  reglamento:    { label: '⚖️ Reglamento y Convivencia', color: 'bg-amber-700' },
  legal:         { label: '🎓 Sabías que... (Legal)',      color: 'bg-indigo-700' },
  curiosidades:  { label: '💡 Curiosidades',               color: 'bg-yellow-500', story: true },
  agua_recursos: { label: '💧 Agua y Recursos',            color: 'bg-cyan-600' },
  seguridad:     { label: '🛡️ Seguridad y Prevención',     color: 'bg-red-700', icon: Shield },
  mantenimiento: { label: '🔧 Mantenimiento y Obra',       color: 'bg-orange-500' },
  transparencia: { label: '📊 Transparencia K\'eni',       color: 'bg-blue-700' },
};

export default function NoticeCarousel({ notices }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (notices.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [notices.length, isPaused]);

  if (notices.length === 0) {
    return (
      <div className="flex items-center justify-center h-[480px] bg-slate-100 rounded-3xl">
        <p className="text-slate-400 text-xl">No hay avisos disponibles</p>
      </div>
    );
  }

  const notice = notices[currentIndex];
  const config = typeConfig[notice?.type] || typeConfig.reglamento;
  const image = notice?.image_url || typeImages[notice?.type] || typeImages.reglamento;
  const Icon = config.icon;
  const isStory = config.story;

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-md"
      style={{ height: '480px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <img src={image} alt={notice.title} className="w-full h-full object-cover" />

          {isStory ? (
            /* Story format: full-bleed with centered white text overlay */
            <>
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-5 ${config.color}`}>
                  {config.label}
                </div>
                <h2 className="text-white font-bold text-4xl leading-tight mb-4 drop-shadow-lg">
                  {notice.title}
                </h2>
                <p className="text-white/90 text-xl leading-relaxed drop-shadow">{notice.content}</p>
              </div>
            </>
          ) : (
            /* Standard format: gradient bottom with text */
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className={`absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold ${config.color}`}>
                {Icon && <Icon className="w-4 h-4" />}
                {config.label}
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-8 py-7">
                <h2 className="text-white font-bold text-3xl leading-tight line-clamp-2 mb-2">
                  {notice.title}
                </h2>
                <p className="text-white/80 text-lg line-clamp-1">{notice.content}</p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav Arrows */}
      {notices.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % notices.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </Button>
        </>
      )}

      {/* Dots */}
      {notices.length > 1 && (
        <div className="absolute bottom-5 right-8 flex gap-2">
          {notices.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}