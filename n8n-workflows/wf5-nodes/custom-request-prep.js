const ev = $input.first().json;
const d = ev.data || {};
const MAIL_FROM  = 'Black Label Market <hola@blacklabelmarket.es>';
const MARKET_URL = 'https://blacklabelmarket.es';

const name     = d.contact?.name  || d.name  || 'Interesado';
const email    = d.contact?.email || d.email || '';
const brand    = d.brand || '';
const model    = d.model || '';
const budget   = d.budget || d.budget_text || '';
const timeline = d.timeframe || d.timeline || '';

const TIMELINE_LABELS = {
  immediate: 'Lo antes posible',
  '1_3_months': 'En 1-3 meses',
  '3_6_months': 'En 3-6 meses',
  exploring: 'Explorando opciones'
};
const timelineLabel = TIMELINE_LABELS[timeline] || timeline;

const location = d.location || '';
const vehicleDesc = [brand, model].filter(Boolean).join(' ') || 'tu vehículo a medida';

const slackPayload = {
  text: `:memo: *Nueva solicitud a la carta* — ${name} busca *${vehicleDesc}*\n`
    + [budget ? 'Presupuesto: ' + budget : '', location, timelineLabel ? 'Plazo: ' + timelineLabel : '', email]
        .filter(Boolean).join(' · ')
};

const html = `<p>Hola ${name},</p>
<p>Hemos recibido tu solicitud de <strong>${vehicleDesc}</strong>.</p>
<p>Nuestro equipo la analizará y contactará con los concesionarios especializados más adecuados. Te responderemos en un plazo de 24-48 horas laborables.</p>
${budget ? '<p><strong>Presupuesto:</strong> ' + budget + '</p>' : ''}
${timelineLabel ? '<p><strong>Plazo:</strong> ' + timelineLabel + '</p>' : ''}
<p>El equipo de Black Label Market</p>`;

return [{
  json: {
    ...ev,
    name, email, slackPayload,
    emailPayload: email ? {
      from: MAIL_FROM, to: [email],
      subject: `Solicitud recibida: ${vehicleDesc} — Black Label Market`,
      html
    } : null
  }
}];
