import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const task = body.data;
    const oldTask = body.old_data;

    // Solo notificar si cambió el estado
    if (!task || !oldTask || task.status === oldTask.status) {
      return Response.json({ skipped: true, reason: 'no status change' });
    }

    const statusLabels = {
      pendiente: '🕐 Pendiente',
      en_progreso: '🔧 En progreso',
      completada: '✅ Completada',
    };

    const priorityLabels = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      urgente: '🔴 Urgente',
    };

    // Obtener suscriptores que quieren updates de mantenimiento
    const allSubs = await base44.asServiceRole.entities.NotificationSubscription.filter({
      is_active: true,
      notify_maintenance: true,
    });

    const targets = task.condominio_id
      ? allSubs.filter(s => !s.condominio_id || s.condominio_id === task.condominio_id)
      : allSubs;

    if (targets.length === 0) return Response.json({ sent: 0 });

    let sent = 0;
    for (const sub of targets) {
      const isCompleted = task.status === 'completada';
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.email,
        from_name: "K'eni Connect",
        subject: `🔧 Mantenimiento actualizado: ${task.title}`,
        body: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f8fafc;border-radius:16px">
            <div style="background:${isCompleted ? '#16a34a' : '#ea580c'};border-radius:12px;padding:20px 24px;margin-bottom:20px">
              <h1 style="color:white;margin:0;font-size:20px">🔧 Actualización de Mantenimiento</h1>
              ${task.condominio_name ? `<p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">${task.condominio_name}</p>` : ''}
            </div>
            <div style="background:white;border-radius:12px;padding:20px 24px;border:1px solid #e2e8f0">
              <h2 style="margin:0 0 8px;font-size:18px;color:#1e293b">${task.title}</h2>
              <p style="margin:0 0 12px;color:#64748b;font-size:14px">Área: ${task.area} · Prioridad: ${priorityLabels[task.priority] || task.priority}</p>
              <div style="display:flex;align-items:center;gap:12px;background:#f1f5f9;border-radius:8px;padding:12px">
                <div style="text-align:center;flex:1">
                  <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase">Antes</p>
                  <p style="margin:4px 0 0;font-weight:600;color:#64748b">${statusLabels[oldTask.status] || oldTask.status}</p>
                </div>
                <span style="color:#94a3b8;font-size:20px">→</span>
                <div style="text-align:center;flex:1">
                  <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase">Ahora</p>
                  <p style="margin:4px 0 0;font-weight:700;color:#1e293b">${statusLabels[task.status] || task.status}</p>
                </div>
              </div>
              ${task.evidence_note ? `<p style="margin:12px 0 0;color:#16a34a;font-style:italic">✓ ${task.evidence_note}</p>` : ''}
              ${task.evidence_url ? `<img src="${task.evidence_url}" style="width:100%;border-radius:8px;margin-top:12px" />` : ''}
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">
              Hola ${sub.name} (Depto ${sub.department}), recibes este aviso porque tienes activas las notificaciones de mantenimiento.
            </p>
          </div>
        `,
      });
      sent++;
    }

    return Response.json({ sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});