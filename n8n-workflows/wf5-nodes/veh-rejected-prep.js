const ev = $input.first().json;
const d = ev.data || {};
const MAIL_FROM  = 'Black Label Market <hola@blacklabelmarket.es>';
const MARKET_URL = 'https://blacklabelmarket.es';

const dealerEmail  = d.dealer_email  || '';
const vehicleTitle = d.vehicle_title || [d.brand, d.model, d.year].filter(Boolean).join(' ') || 'tu vehículo';
const reason       = d.rejection_reason || d.reason || 'No cumple los requisitos editoriales actuales de la plataforma.';

const html = `<p>Hola,</p>
<p>Hemos revisado la ficha de <strong>${vehicleTitle}</strong> y por ahora no podemos publicarla en Black Label Market.</p>
<p><strong>Motivo:</strong> ${reason}</p>
<p>Puedes editar la ficha desde tu panel y volver a enviarla a revisión cuando quieras.</p>
<p><a href="${MARKET_URL}/dashboard/inventario">Acceder a tu inventario →</a></p>
<p>El equipo de Black Label Market</p>`;

return [{
  json: {
    ...ev, dealerEmail, vehicleTitle,
    emailPayload: dealerEmail ? {
      from: MAIL_FROM, to: [dealerEmail],
      subject: `Ficha no aprobada: ${vehicleTitle}`,
      html
    } : null
  }
}];
