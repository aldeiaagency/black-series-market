const ev = $input.first().json;
const d = ev.data || {};
const MAIL_FROM  = 'Black Label Market <hola@blacklabelmarket.es>';
const MARKET_URL = 'https://blacklabelmarket.es';

// El market (search_alert.created) envía el contacto en d.contact.*
const email   = d.contact?.email || d.user_email || d.email || '';
const name    = d.contact?.name  || d.user_name  || d.name  || '';
const brand   = d.brand || d.criteria?.brand || '';
const model   = d.model || d.criteria?.model || '';
const budget  = d.budget_max || d.criteria?.max_price || d.max_price || '';
const location = d.location || '';

const criteriaParts = [
  [brand, model].filter(Boolean).join(' '),
  budget ? `hasta ${budget}` : '',
  location ? `en ${location}` : ''
].filter(Boolean);
const criteriaDesc = criteriaParts.join(' · ') || 'los criterios que has indicado';

const greetingName = name ? ` ${name}` : '';
const html = `<p>Hola${greetingName},</p>
<p>Tu alerta de búsqueda ha quedado guardada en Black Label Market.</p>
<p><strong>Criterios:</strong> ${criteriaDesc}</p>
<p>Te avisaremos por email en cuanto publiquemos un vehículo que encaje con tu búsqueda.</p>
<p>El equipo de Black Label Market</p>`;

return [{
  json: {
    ...ev,
    name, email,
    emailPayload: email ? {
      from: MAIL_FROM, to: [email],
      subject: 'Alerta guardada — Black Label Market',
      html
    } : null
  }
}];
