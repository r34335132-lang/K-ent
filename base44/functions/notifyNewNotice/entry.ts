import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Solo disparar en creación de avisos activos
    const notice = body.data;
    if (!notice || notice.is_active === false) {
      return Response.json({ skipped: true });
    }

    // Obtener suscriptores activos del condominio o todos si es global
    const allSubs = await base44.asServiceRole.entities.NotificationSubscription.filter({ is_active: true });

    const targets = notice.is_global
      ? allSubs.filter(s => s.notify_notices)
      : allSubs.filter(s => s.notify_notices && (!notice.condominio_id || s.condominio_id === notice.condominio_id || !s.condominio_id));

    if (targets.length === 0) return Response.json({ sent: 0 });

    const typeLabels = {
      reglamento: 'Reglamento y Convivencia',
      legal: 'Legal',
      curiosidades: 'Curiosidades',
      agua_recursos: 'Gestión de Agua',
      seguridad: 'Seguridad',
      mantenimiento: 'Mantenimiento',
      transparencia: 'Transparencia',
    };

    let sent = 0;
    for (const sub of targets) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.email,
        from_name: "K'eni Connect",
        subject: `📢 Nuevo aviso: ${notice.title}`,
        body: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f8fafc;border-radius:16px">
            <div style="background:#2563eb;border-radius:12px;padding:20px 24px;margin-bottom:20px">
              <h1 style="color:white;margin:0;font-size:20px">📢 Nuevo Aviso Publicado</h1>
              ${notice.condominio_name ? `<p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Condominio: ${notice.condominio_name}</p>` : ''}
            </div>
            <div style="background:white;border-radius:12px;padding:20px 24px;border:1px solid #e2e8f0">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;font-weight:600">${typeLabels[notice.type] || notice.type}</p>
              <h2 style="margin:0 0 12px;font-size:18px;color:#1e293b">${notice.title}</h2>
              <p style="color:#475569;line-height:1.6;margin:0">${notice.content}</p>
              ${notice.image_url ? `<img src="${notice.image_url}" style="width:100%;border-radius:8px;margin-top:16px" />` : ''}
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">
              Hola ${sub.name}, recibes este correo porque estás suscrito a los avisos de tu condominio.<br/>
              Depto: ${sub.department}
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