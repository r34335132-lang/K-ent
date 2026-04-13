import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle, User, Home, MessageSquare, Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CommentForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    message: '',
    category: 'sugerencia'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await base44.entities.Comment.create(formData);
    
    // Enviar notificación por email al administrador
    await base44.integrations.Core.SendEmail({
      to: 'admin@condominio.com',
      subject: `Nuevo comentario de ${formData.name} - Depto ${formData.department}`,
      body: `
        <h2>Nuevo comentario en el buzón</h2>
        <p><strong>Nombre:</strong> ${formData.name}</p>
        <p><strong>Departamento:</strong> ${formData.department}</p>
        <p><strong>Categoría:</strong> ${formData.category}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${formData.message}</p>
      `
    });

    setShowSuccess(true);
    setFormData({ name: '', department: '', message: '', category: 'sugerencia' });
    setIsSubmitting(false);

    setTimeout(() => {
      setShowSuccess(false);
      if (onSuccess) onSuccess();
    }, 3000);
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Gracias por tu comentario!</h3>
        <p className="text-slate-500">Tu mensaje ha sido enviado al administrador.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <User className="w-4 h-4" />
            Nombre Completo
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Tu nombre"
            required
            className="h-14 text-lg rounded-xl border-slate-200 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Home className="w-4 h-4" />
            Departamento
          </label>
          <Input
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Ej: A-101"
            required
            className="h-14 text-lg rounded-xl border-slate-200 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Tag className="w-4 h-4" />
          Tipo de Comentario
        </label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="h-14 text-lg rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sugerencia">💡 Sugerencia</SelectItem>
            <SelectItem value="queja">📢 Queja</SelectItem>
            <SelectItem value="felicitacion">🎉 Felicitación</SelectItem>
            <SelectItem value="reporte">🔧 Reporte de Falla</SelectItem>
            <SelectItem value="otro">📝 Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <MessageSquare className="w-4 h-4" />
          Tu Mensaje
        </label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Escribe tu comentario, sugerencia o recomendación..."
          required
          rows={5}
          className="text-lg rounded-xl border-slate-200 focus:border-blue-500 resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-16 text-xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
            />
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <Send className="w-6 h-6" />
            Enviar Comentario
          </span>
        )}
      </Button>
    </form>
  );
}