import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2, FileDown, Wallet, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EMPTY = { concept: '', amount: '', category: 'Mantenimiento', date: '', vendor: '', invoice_number: '' };
const CATEGORIES = ['Mantenimiento','Servicios','Seguridad','Limpieza','Jardines','Administración','Emergencias','Otros'];
const formatCurrency = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);

export default function ExpensesPanel({ readOnly = false }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses-admin'],
    queryFn: () => base44.entities.Expense.list('-date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({ ...data, amount: parseFloat(data.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses-admin'] }); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, { ...data, amount: parseFloat(data.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses-admin'] }); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses-admin'] }),
  });

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const handleEdit = (expense) => {
    setForm({ ...expense, amount: String(expense.amount) });
    setEditing(expense.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing, data: form });
    else createMutation.mutate(form);
  };

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // NUEVA FUNCIÓN: Generación de PDF Nativo
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título y Cabecera del Documento
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // Azul premium
    doc.text("Reporte de Gastos Condominales", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}`, 14, 30);
    doc.text(`Total de egresos: ${formatCurrency(total)}`, 14, 36);

    // Preparar la tabla de datos
    const tableColumn = ["Fecha", "Concepto", "Categoría", "Proveedor", "Monto"];
    const tableRows = [];

    expenses.forEach(exp => {
      const expenseData = [
        exp.date,
        exp.concept,
        exp.category,
        exp.vendor || 'N/A',
        formatCurrency(exp.amount)
      ];
      tableRows.push(expenseData);
    });

    // Dibujar la tabla en el PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Guardar archivo nativamente en el dispositivo
    doc.save(`Reporte_Gastos_${format(new Date(), 'MMM_yyyy')}.pdf`);
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Gastos</h2>
          <p className="text-slate-500 text-base font-medium mt-1">Administra los egresos y genera reportes financieros.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón de PDF */}
          <Button 
            onClick={exportToPDF} 
            disabled={expenses.length === 0}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl h-12 px-5 font-bold shadow-sm transition-all active:scale-95 gap-2"
          >
            <FileDown className="w-5 h-5 text-blue-600" strokeWidth={2} /> 
            Exportar PDF
          </Button>
          
          {!showForm && !readOnly && (
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-black text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-slate-900/20 transition-all active:scale-95 gap-2">
              <Plus className="w-5 h-5" strokeWidth={2} /> Nuevo Gasto
            </Button>
          )}
        </div>
      </div>

      {/* Tarjeta de Resumen Estilo Premium */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] px-8 py-8 mb-8 shadow-lg shadow-emerald-500/20 border border-emerald-400">
        <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-white/10 rotate-12 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-emerald-100" strokeWidth={2} />
              <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs">Total de Egresos Registrados</p>
            </div>
            <p className="text-5xl md:text-6xl font-light text-white tracking-tighter tabular-nums drop-shadow-md">{formatCurrency(total)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-center">
            <p className="text-2xl font-bold text-white leading-none">{expenses.length}</p>
            <p className="text-emerald-50 text-xs font-semibold mt-1">Registros activos</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{editing ? 'Editando Registro' : 'Registrar Nuevo Gasto'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-700 block mb-2">Concepto / Descripción</label>
                <input className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all" value={form.concept} onChange={e => setForm(f => ({ ...f, concept: e.target.value }))} placeholder="Ej. Compra de material de limpieza" required />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Monto (MXN)</label>
                <input type="number" step="0.01" className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all font-semibold" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Categoría</label>
                <select className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all appearance-none" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Fecha de emisión</label>
                <input type="date" className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all text-slate-600" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Proveedor (Opcional)</label>
                <input className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Nombre de la empresa o persona" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-700 block mb-2">N° Factura / Folio (Opcional)</label>
                <input className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all" value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="Ej. FAC-2023-001" />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1 rounded-2xl h-14 font-bold text-lg border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</Button>
              <Button type="submit" className="flex-1 bg-slate-900 hover:bg-black text-white rounded-2xl h-14 font-bold text-lg shadow-xl shadow-slate-900/20">
                {editing ? 'Guardar Cambios' : 'Confirmar Gasto'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Gastos */}
      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <div key={exp.id} className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-5">
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">{exp.category}</span>
                  <span className="text-xs font-semibold text-slate-400">{format(new Date(exp.date), "dd MMM yyyy", { locale: es })}</span>
                </div>
                <p className="text-lg font-bold text-slate-800 truncate">{exp.concept}</p>
                {(exp.vendor || exp.invoice_number) && (
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                    {exp.vendor && <span>🏢 {exp.vendor}</span>}
                    {exp.vendor && exp.invoice_number && <span className="text-slate-300">|</span>}
                    {exp.invoice_number && <span>🧾 Folio: {exp.invoice_number}</span>}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                <p className="font-black text-slate-800 text-2xl tracking-tight">{formatCurrency(exp.amount)}</p>
                
                {!readOnly && (
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(exp)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button onClick={() => deleteMutation.mutate(exp.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-slate-700">Sin movimientos</p>
              <p className="text-slate-500 mt-1">Aún no se han registrado gastos en el sistema.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}