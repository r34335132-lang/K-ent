import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileDown, Loader2, Calendar, CheckCircle, Wrench, MessageSquare, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);

const PRIORITY_LABEL = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'URGENTE' };
const STATUS_LABEL = { pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada' };
const CATEGORY_EMOJI = { sugerencia: '💡', queja: '📢', felicitacion: '🎉', reporte: '🔧', otro: '📝' };

export default function ResumenPanel() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(now, 'yyyy-MM'));
  const [generating, setGenerating] = useState(false);

  const monthStart = startOfMonth(parseISO(selectedMonth + '-01'));
  const monthEnd = endOfMonth(parseISO(selectedMonth + '-01'));
  const monthLabel = format(monthStart, "MMMM 'de' yyyy", { locale: es });

  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = parseISO(dateStr);
    return d >= monthStart && d <= monthEnd;
  };

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks-resumen'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 500),
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses-resumen'],
    queryFn: () => base44.entities.Expense.list('-date', 500),
  });

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments-resumen'],
    queryFn: () => base44.entities.Comment.list('-created_date', 500),
  });

  const isLoading = loadingTasks || loadingExpenses || loadingComments;

  // Filter by month
  const monthTasks = tasks.filter(t => inRange(t.scheduled_date) || inRange(t.created_date?.slice(0, 10)));
  const monthExpenses = expenses.filter(e => inRange(e.date));
  const monthComments = comments.filter(c => inRange(c.created_date?.slice(0, 10)));

  const totalExpenses = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const completedTasks = monthTasks.filter(t => t.status === 'completada');
  const urgentTasks = monthTasks.filter(t => t.priority === 'urgente');
  const newComments = monthComments.filter(c => c.status !== 'respondido');

  const generatePDF = async () => {
    setGenerating(true);

    // Group expenses by category
    const expByCategory = monthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
      return acc;
    }, {});

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Resumen Mensual - ${monthLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    .header { background: linear-gradient(135deg, #1e40af, #2563eb); color: white; padding: 32px 40px; border-radius: 16px; margin-bottom: 32px; }
    .header h1 { font-size: 28px; font-weight: 800; }
    .header p { font-size: 14px; opacity: 0.8; margin-top: 6px; }
    .header .meta { font-size: 13px; opacity: 0.65; margin-top: 4px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
    .stat .value { font-size: 32px; font-weight: 800; color: #1e40af; }
    .stat .label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 700; color: #1e293b; border-left: 4px solid #2563eb; padding-left: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1e40af; color: white; padding: 10px 14px; text-align: left; }
    td { padding: 9px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    .badge-gray { background: #f1f5f9; color: #475569; }
    .finance-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .finance-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; font-weight: 800; color: #1e40af; border-top: 2px solid #2563eb; margin-top: 8px; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    @media print {
      body { padding: 20px; }
      .header { border-radius: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .stats, .stat { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .no-data { color: #94a3b8; font-style: italic; font-size: 13px; padding: 12px 0; }
    .message-box { background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
    .message-box .from { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
    .message-box .text { font-size: 12px; color: #475569; }
    .message-box .response { font-size: 12px; color: #166534; margin-top: 6px; padding-top: 6px; border-top: 1px solid #d1fae5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Resumen Mensual del Condominio</h1>
    <p>${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</p>
    <p class="meta">Generado el ${format(new Date(), "dd 'de' MMMM de yyyy, HH:mm", { locale: es })}</p>
  </div>

  <!-- STATS -->
  <div class="stats">
    <div class="stat">
      <div class="value">${monthTasks.length}</div>
      <div class="label">Tareas registradas</div>
    </div>
    <div class="stat">
      <div class="value">${completedTasks.length}</div>
      <div class="label">Tareas completadas</div>
    </div>
    <div class="stat">
      <div class="value">${monthComments.length}</div>
      <div class="label">Mensajes recibidos</div>
    </div>
    <div class="stat">
      <div class="value">${formatCurrency(totalExpenses)}</div>
      <div class="label">Total de gastos</div>
    </div>
  </div>

  <!-- TICKETS / TAREAS -->
  <div class="section">
    <div class="section-title">🔧 Tickets y Trabajos de Mantenimiento</div>
    ${monthTasks.length === 0
      ? '<p class="no-data">No se registraron tareas en este período.</p>'
      : `<table>
      <thead><tr>
        <th>Tarea</th><th>Área</th><th>Prioridad</th><th>Estado</th><th>Fecha Prog.</th><th>Asignado</th>
      </tr></thead>
      <tbody>
        ${monthTasks.map(t => `
        <tr>
          <td>${t.title}${t.description ? `<br><span style="color:#94a3b8;font-size:11px">${t.description.slice(0, 80)}${t.description.length > 80 ? '...' : ''}</span>` : ''}</td>
          <td>${t.area || '-'}</td>
          <td><span class="badge badge-${t.priority === 'urgente' ? 'red' : t.priority === 'alta' ? 'yellow' : 'gray'}">${PRIORITY_LABEL[t.priority] || t.priority}</span></td>
          <td><span class="badge badge-${t.status === 'completada' ? 'green' : t.status === 'en_progreso' ? 'blue' : 'gray'}">${STATUS_LABEL[t.status] || t.status}</span></td>
          <td>${t.scheduled_date || '-'}</td>
          <td>${t.assigned_to || '-'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`}
  </div>

  <!-- MENSAJES / BUZON -->
  <div class="section">
    <div class="section-title">💬 Mensajes del Buzón</div>
    ${monthComments.length === 0
      ? '<p class="no-data">No se recibieron mensajes en este período.</p>'
      : monthComments.map(c => `
      <div class="message-box">
        <div class="from">${CATEGORY_EMOJI[c.category] || '📝'} ${c.name} — Depto. ${c.department} <span style="color:#94a3b8;font-size:11px;font-weight:400">(${c.status})</span></div>
        <div class="text">${c.message}</div>
        ${c.admin_response ? `<div class="response">✅ Respuesta: ${c.admin_response}</div>` : ''}
      </div>`).join('')}
  </div>

  <!-- FINANZAS -->
  <div class="section">
    <div class="section-title">💰 Reporte Financiero</div>
    ${monthExpenses.length === 0
      ? '<p class="no-data">No se registraron gastos en este período.</p>'
      : `<table>
      <thead><tr>
        <th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Proveedor</th><th>Factura</th><th>Monto</th>
      </tr></thead>
      <tbody>
        ${monthExpenses.map(e => `
        <tr>
          <td>${e.date}</td>
          <td>${e.concept}</td>
          <td><span class="badge badge-blue">${e.category}</span></td>
          <td>${e.vendor || '-'}</td>
          <td>${e.invoice_number || '-'}</td>
          <td style="font-weight:700;color:#15803d">${formatCurrency(e.amount)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <br/>
    <div style="max-width:400px;margin-left:auto;">
      <p style="font-size:14px;font-weight:700;color:#64748b;margin-bottom:8px">Resumen por categoría:</p>
      ${Object.entries(expByCategory).map(([cat, amt]) => `
      <div class="finance-row"><span>${cat}</span><span style="font-weight:600">${formatCurrency(amt)}</span></div>`).join('')}
      <div class="finance-total"><span>TOTAL DEL PERÍODO</span><span>${formatCurrency(totalExpenses)}</span></div>
    </div>`}
  </div>

  <div class="footer">
    K'eni Connect — Sistema de Gestión Condominal · Reporte generado automáticamente
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      setGenerating(false);
    };
    // Fallback in case onload doesn't fire
    setTimeout(() => setGenerating(false), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resumen Mensual</h2>
          <p className="text-slate-500 text-sm mt-0.5">Genera un reporte descargable con toda la actividad del mes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-sm font-semibold text-slate-700 focus:outline-none bg-transparent"
            />
          </div>
          <Button
            onClick={generatePDF}
            disabled={generating || isLoading}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2 px-6"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {generating ? 'Generando...' : 'Descargar Reporte'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{monthTasks.length}</p>
              <p className="text-slate-500 text-sm mt-1">Tareas del mes</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{completedTasks.length}</p>
              <p className="text-slate-500 text-sm mt-1">Completadas</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{monthComments.length}</p>
              <p className="text-slate-500 text-sm mt-1">Mensajes recibidos</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpenses)}</p>
              <p className="text-slate-500 text-sm mt-1">Total gastos</p>
            </div>
          </div>

          {/* Alerts */}
          {urgentTasks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700 text-sm">{urgentTasks.length} tarea(s) urgente(s) este mes</p>
                <p className="text-red-600 text-xs mt-0.5">{urgentTasks.map(t => t.title).join(', ')}</p>
              </div>
            </div>
          )}

          {/* Previews */}
          <div className="grid grid-cols-3 gap-6">
            {/* Tasks preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-500" /> Tareas de Mantenimiento
              </h3>
              <div className="space-y-2">
                {monthTasks.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <p className="text-sm text-slate-700 truncate flex-1">{t.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                      t.status === 'completada' ? 'bg-green-100 text-green-700' :
                      t.status === 'en_progreso' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>{STATUS_LABEL[t.status]}</span>
                  </div>
                ))}
                {monthTasks.length === 0 && <p className="text-slate-400 text-sm">Sin tareas este mes</p>}
                {monthTasks.length > 5 && <p className="text-slate-400 text-xs mt-2">+{monthTasks.length - 5} más en el reporte</p>}
              </div>
            </div>

            {/* Comments preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500" /> Mensajes del Buzón
              </h3>
              <div className="space-y-2">
                {monthComments.slice(0, 5).map(c => (
                  <div key={c.id} className="py-1.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">{c.name}</p>
                      <span className="text-xs text-slate-400">{CATEGORY_EMOJI[c.category]}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.message}</p>
                  </div>
                ))}
                {monthComments.length === 0 && <p className="text-slate-400 text-sm">Sin mensajes este mes</p>}
                {monthComments.length > 5 && <p className="text-slate-400 text-xs mt-2">+{monthComments.length - 5} más en el reporte</p>}
              </div>
            </div>

            {/* Expenses preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Gastos del Mes
              </h3>
              <div className="space-y-2">
                {monthExpenses.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <p className="text-sm text-slate-700 truncate flex-1">{e.concept}</p>
                    <p className="text-sm font-bold text-emerald-600 ml-2 flex-shrink-0">{formatCurrency(e.amount)}</p>
                  </div>
                ))}
                {monthExpenses.length === 0 && <p className="text-slate-400 text-sm">Sin gastos este mes</p>}
                {monthExpenses.length > 5 && <p className="text-slate-400 text-xs mt-2">+{monthExpenses.length - 5} más en el reporte</p>}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex items-center justify-between text-white">
            <div>
              <p className="font-bold text-lg">¿Todo listo para el reporte?</p>
              <p className="text-blue-200 text-sm mt-1">
                El reporte incluye {monthTasks.length} tareas, {monthComments.length} mensajes y {monthExpenses.length} registros financieros.
              </p>
            </div>
            <Button
              onClick={generatePDF}
              disabled={generating || isLoading}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl h-12 px-8 gap-2 flex-shrink-0"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Descargar PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
}