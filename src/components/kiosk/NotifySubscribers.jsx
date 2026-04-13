import { base44 } from '@/api/base44Client';

/**
 * Sends email notifications to matching subscribers.
 * @param {'notices' | 'maintenance' | 'report_updates'} type
 * @param {{ subject: string, body: string }} email
 */
export async function notifySubscribers(type, { subject, body }) {
  const prefKey = type === 'notices' ? 'notify_notices'
    : type === 'maintenance' ? 'notify_maintenance'
    : 'notify_report_updates';

  const subs = await base44.entities.NotificationSubscriber.filter({ is_active: true });
  const targets = subs.filter(s => s[prefKey]);

  await Promise.all(targets.map(sub =>
    base44.integrations.Core.SendEmail({
      to: sub.email,
      subject,
      body: body.replace('{{name}}', sub.name).replace('{{department}}', sub.department)
    })
  ));

  return targets.length;
}