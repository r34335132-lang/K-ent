import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gastos</h2>
          <p className="text-slate-500 text-sm mt-0.5">Registro de gastos y egresos del condominio</p>
        </div>
        {!showForm && !readOnly && (
          <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" /> Nuevo Gasto
          </Button>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-6 py-4 mb-6 text-white flex items-center justify-between">
        <p className="text-green-100 text-sm">Total registrado</p>
        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
        <p className="text-green-200 text-sm">{expenses.length} registros</p>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">{editing ? 'Editar Gasto' : 'Nuevo Gasto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Concepto</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-green-500" value={form.concept} onChange={e => setForm(f => ({ ...f, concept: e.target.value }))} placeholder="Descripción del gasto" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Monto (MXN)</label>
                <input type="number" step="0.01" className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-green-500" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Categoría</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Fecha</label>
                <input type="date" className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Proveedor</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Nombre del proveedor" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">N° Factura</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="Folio de factura" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-10">Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-xl h-10">
                {editing ? 'Guardar cambios' : 'Registrar gasto'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{exp.category}</span>
                  <span className="text-xs text-slate-400">{exp.date}</span>
                </div>
                <p className="font-semibold text-slate-800 truncate">{exp.concept}</p>
                {exp.vendor && <p className="text-xs text-slate-400">{exp.vendor}</p>}
              </div>
              <p className="font-bold text-green-600 text-sm flex-shrink-0">{formatCurrency(exp.amount)}</p>
              {!readOnly && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(exp)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(exp.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay gastos registrados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}