import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, MessageSquare, Send, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_COLORS = {
  nuevo: 'bg-blue-100 text-blue-700',
  leido: 'bg-slate-100 text-slate-600',
  respondido: 'bg-green-100 text-green-700'
};

const CATEGORY_EMOJI = {
  sugerencia: '💡',
  queja: '📢',
  felicitacion: '🎉',
  reporte: '🔧',
  otro: '📝'
};

export default function CommentsPanel() {
  const qc = useQueryClient();
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments-admin'],
    queryFn: () => base44.entities.Comment.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Comment.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments-admin'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments-admin'] }),
  });

  const markRead = (comment) => {
    if (comment.status === 'nuevo') {
      updateMutation.mutate({ id: comment.id, data: { status: 'leido' } });
    }
  };

  const sendReply = async (comment) => {
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: comment.email || 'residente@condominio.com',
      subject: `Respuesta a tu mensaje - Portal Condominal`,
      body: `<p>Hola ${comment.name},</p><p>En respuesta a tu mensaje:</p><blockquote>${comment.message}</blockquote><p>${replyText}</p><p>— Administración del Condominio</p>`
    });
    await updateMutation.mutateAsync({ id: comment.id, data: { status: 'respondido', admin_response: replyText } });
    setReplyTarget(null);
    setReplyText('');
    setSending(false);
  };

  const newCount = comments.filter(c => c.status === 'nuevo').length;

  // Group comments by condominio
  const grouped = comments.reduce((acc, c) => {
    const key = c.condominio_name || 'Sin condominio';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Buzón de Mensajes</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {newCount > 0 ? `${newCount} mensaje(s) nuevo(s)` : 'Todos los mensajes revisados'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([condominioName, condoComments]) => (
            <div key={condominioName}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-700">{condominioName}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  {condoComments.filter(c => c.status === 'nuevo').length} nuevos
                </span>
              </div>
              <div className="space-y-3">
          {condoComments.map(comment => (
            <div
              key={comment.id}
              className={`bg-white rounded-2xl p-5 border transition cursor-pointer ${comment.status === 'nuevo' ? 'border-blue-200' : 'border-slate-100'}`}
              onClick={() => markRead(comment)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-800">{CATEGORY_EMOJI[comment.category]} {comment.name}</span>
                    <span className="text-xs text-slate-400">· Depto {comment.department}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[comment.status]}`}>{comment.status}</span>
                  </div>
                  <p className="text-slate-600 text-sm">{comment.message}</p>
                  {comment.admin_response && (
                    <div className="mt-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                      <p className="text-xs font-semibold text-green-700 mb-1">Tu respuesta:</p>
                      <p className="text-sm text-green-800">{comment.admin_response}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setReplyTarget(comment.id); setReplyText(''); }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(comment.id); }}
                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {replyTarget === comment.id && (
                <div className="mt-4 flex gap-3" onClick={e => e.stopPropagation()}>
                  <textarea
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    rows={2}
                    placeholder="Escribe tu respuesta..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => sendReply(comment)}
                      disabled={!replyText || sending}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2 text-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sending ? 'Enviando...' : 'Responder'}
                    </Button>
                    <Button variant="outline" onClick={() => setReplyTarget(null)} className="rounded-xl h-10 text-sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay mensajes en el buzón.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}