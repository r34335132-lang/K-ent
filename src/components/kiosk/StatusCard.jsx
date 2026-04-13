import React from 'react';
import { motion } from 'framer-motion';

const areaImages = {
  Cisternas: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80',
  Elevadores: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  Jardines: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
  Estacionamiento: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80',
  'Áreas comunes': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
  Fachada: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
  Iluminación: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80',
  Seguridad: 'https://images.unsplash.com/photo-1557597774-9d475d3a1f3a?w=600&q=80',
};

const statusBadge = {
  pendiente: { label: 'Próximamente', color: 'bg-amber-500' },
  en_progreso: { label: 'En curso', color: 'bg-blue-500' },
  completada: { label: 'Finalizado', color: 'bg-emerald-500' },
};

export default function StatusCard({ task, index }) {
  const image = areaImages[task.area] || areaImages['Áreas comunes'];
  const badge = statusBadge[task.status] || statusBadge.pendiente;

  // Construir descripción corta
  const shortDesc = task.completion_date
    ? `${task.area} · Finaliza ${task.completion_date}`
    : task.area;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white"
    >
      {/* Image — 70% of card */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <img
          src={image}
          alt={task.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Content — 30% */}
      <div className="px-5 py-4">
        <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1">
          {task.title}
        </h3>
        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{shortDesc}</p>
      </div>
    </motion.div>
  );
}