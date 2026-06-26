// Entrada: $json = resultado del lookup (vehículo + dealer embebido desde Supabase).
// El evento original (contacto del comprador) se lee de "Normalizar evento".
const ev = $('Normalizar evento').first().json;
const d = ev.data || {};
let look = $input.first().json || {};
// PostgREST con Accept pgrst.object devuelve content-type que n8n no parsea →
// el cuerpo llega como string JSON en look.data. Parsearlo si procede.
if (look && typeof look.data === 'string') { try { look = JSON.parse(look.data); } catch (e) {} }

const MAIL_FROM  = 'Black Label Market <hola@blacklabelmarket.es>';
const MARKET_URL = 'https://blacklabelmarket.es';

const buyerName  = d.contact?.name  || d.buyer_name  || d.name  || 'Interesado';
const buyerEmail = d.contact?.email || d.buyer_email || d.email || '';
const buyerPhone = d.contact?.phone || d.buyer_phone || '';
const message    = (d.message || '').toString().slice(0, 800);

// El lookup puede fallar (lead sin vehicle_id, p.ej. asistente) → degradar con elegancia
const hasVehicle  = look && look.brand_name;
const vehicleTitle = hasVehicle
  ? [look.brand_name, look.model_name, look.year].filter(Boolean).join(' ')
  : 'el vehículo de tu interés';
const vehicleUrl = (hasVehicle && look.slug)
  ? `${MARKET_URL}/coches/${look.slug}`
  : MARKET_URL;
const dealerName  = look?.dealer?.name  || 'el vendedor profesional';
const dealerEmail = look?.dealer?.email || '';

const buyerHtml = `<p>Hola ${buyerName},</p>
<p>Hemos enviado tu consulta sobre <strong>${vehicleTitle}</strong> a ${dealerName}.</p>
<p>El vendedor profesional se pondrá en contacto contigo lo antes posible.</p>
<p><a href="${vehicleUrl}">Ver la ficha del vehículo →</a></p>
<p>El equipo de Black Label Market</p>`;

const dealerHtml = `<p>Has recibido una nueva consulta en Black Label Market.</p>
<p><strong>Vehículo:</strong> ${vehicleTitle}<br>
<strong>Interesado:</strong> ${buyerName}<br>
<strong>Email:</strong> ${buyerEmail}${buyerPhone ? '<br><strong>Teléfono:</strong> ' + buyerPhone : ''}</p>
${message ? '<p><strong>Mensaje:</strong> ' + message + '</p>' : ''}
<p><a href="${MARKET_URL}/dashboard/oportunidades">Ver en tu panel →</a></p>`;

return [{
  json: {
    ...ev,
    buyerName, buyerEmail, dealerName, dealerEmail, vehicleTitle,
    buyerEmailPayload: buyerEmail ? {
      from: MAIL_FROM, to: [buyerEmail],
      subject: `Hemos enviado tu consulta — ${vehicleTitle}`,
      html: buyerHtml
    } : null,
    dealerEmailPayload: dealerEmail ? {
      from: MAIL_FROM, to: [dealerEmail],
      subject: `Nueva consulta: ${vehicleTitle}`,
      html: dealerHtml
    } : null
  }
}];
