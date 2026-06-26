const ev = $input.first().json;
const d = ev.data || {};
const MAIL_FROM  = 'Black Label Market <hola@blacklabelmarket.es>';
const MARKET_URL = 'https://blacklabelmarket.es';

const dealerEmail  = d.dealer_email  || '';
const vehicleTitle = d.vehicle_title || [d.brand, d.model, d.year].filter(Boolean).join(' ') || 'tu vehículo';
const vehicleSlug  = d.vehicle_slug  || d.slug || '';
const vehicleUrl   = vehicleSlug ? `${MARKET_URL}/coches/${vehicleSlug}` : `${MARKET_URL}/dashboard/inventario`;

const html = `<p>Hola,</p>
<p>Tu vehículo <strong>${vehicleTitle}</strong> ha sido aprobado y ya está publicado en Black Label Market.</p>
<p><a href="${vehicleUrl}">Ver la ficha publicada →</a></p>
<p>Los compradores interesados ya pueden contactarte a través de la ficha.</p>
<p>El equipo de Black Label Market</p>`;

return [{
  json: {
    ...ev, dealerEmail, vehicleTitle,
    emailPayload: dealerEmail ? {
      from: MAIL_FROM, to: [dealerEmail],
      subject: `Vehículo aprobado: ${vehicleTitle}`,
      html
    } : null
  }
}];
