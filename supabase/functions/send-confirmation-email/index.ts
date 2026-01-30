import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

// Configuración de encabezados CORS para permitir solicitudes desde cualquier origen.
// En producción, es recomendable restringir esto a tu dominio específico.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST', // Explicitly allow POST method
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- INICIO DE INTERFACES DE TIPOS ---
// Estas interfaces deben coincidir con las definidas en el frontend (types.ts)
interface HotelPassenger {
  name: string;
}

interface HotelRoom {
  quantity: number;
  type: 'single' | 'double';
}

interface HotelDetails {
  required: boolean;
  passengers: HotelPassenger[];
  checkIn: string;      // Se espera en formato ISO string
  checkOut: string;     // Se espera en formato ISO string
  rooms: HotelRoom[];
  suggestions: string;
  accountingAccount?: string;
}

interface Reservation {
  vehicleName: string;
  startDate: string;   // Se espera en formato ISO string
  endDate: string;     // Se espera en formato ISO string
  details: {
    name: string;
    email: string;
    destination: string;
    attendees: string[];
  };
  hotelDetails?: HotelDetails; // La información del hotel es opcional
}
// --- FIN DE INTERFACES DE TIPOS ---


// Declaración de tipo global para Deno.
declare const Deno: any;

// Función principal que se ejecuta al invocar la Edge Function.
serve(async (req: Request) => {
  // Manejar la solicitud pre-vuelo (preflight) de CORS.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. ANÁLISIS ROBUSTO DEL CUERPO DE LA SOLICITUD
    if (!req.body) {
      console.error("Error: La solicitud se recibió sin cuerpo (body).");
      return new Response(JSON.stringify({ error: "La solicitud no contenía un cuerpo." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Bad Request
      });
    }

    const payload = await req.json();
    
    // Para depuración: registrar el payload recibido en los logs de la función.
    console.log('Payload recibido:', JSON.stringify(payload, null, 2));
    
    const reservation: Reservation = payload.reservation;
    if (!reservation) {
      throw new Error("La propiedad 'reservation' no se encontró en el cuerpo de la solicitud.");
    }
    
    // 2. Obtener la clave de la API de Resend desde las variables de entorno seguras de Supabase.
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
        throw new Error("La variable de entorno RESEND_API_KEY no está configurada en los 'Secrets' de tu proyecto de Supabase.");
    }

    // 3. Formatear las fechas para una mejor legibilidad en el correo.
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const startDateFormatted = formatDate(reservation.startDate);
    const endDateFormatted = formatDate(reservation.endDate);

    // 4. Construir la sección de hotelería del correo (solo si es requerida).
    let hotelHtmlSection = '';
    if (reservation.hotelDetails && reservation.hotelDetails.required) {
      const { passengers, checkIn, checkOut, rooms, suggestions, accountingAccount } = reservation.hotelDetails;
      hotelHtmlSection = `
        <hr style="border:0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3 style="color: #005A9C;">Solicitud de Hotelería:</h3>
        <ul>
          <li><strong>Check-in:</strong> ${formatDate(checkIn)}</li>
          <li><strong>Check-out:</strong> ${formatDate(checkOut)}</li>
          <li><strong>Pasajeros:</strong>
            <ul>
              ${passengers.map(p => `<li>${p.name}</li>`).join('')}
            </ul>
          </li>
          <li><strong>Habitaciones:</strong>
            <ul>
              ${rooms.map(r => `<li>${r.quantity} x ${r.type === 'single' ? 'Single' : 'Doble'}</li>`).join('')}
            </ul>
          </li>
          ${suggestions ? `<li><strong>Sugerencias:</strong> ${suggestions}</li>` : ''}
          ${accountingAccount ? `<li><strong>Cuenta Contable:</strong> ${accountingAccount}</li>` : ''}
        </ul>
      `;
    }

    // 5. Construir el cuerpo completo del correo electrónico en formato HTML.
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff; }
          .header { background-color: #002B49; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 25px; }
          .footer { text-align: center; font-size: 0.85em; color: #777; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          strong { color: #002B49; }
          ul { padding-left: 20px; }
          ul ul { padding-left: 15px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>¡Reserva Confirmada!</h1></div>
          <div class="content">
            <p>Hola ${reservation.details.name},</p>
            <p>Tu reserva para el vehículo <strong>${reservation.vehicleName}</strong> ha sido confirmada con éxito.</p>
            <hr style="border:0; border-top: 1px solid #eee; margin: 20px 0;">
            <h3>Detalles del Viaje:</h3>
            <ul>
              <li><strong>Destino:</strong> ${reservation.details.destination}</li>
              <li><strong>Desde:</strong> ${startDateFormatted}</li>
              <li><strong>Hasta:</strong> ${endDateFormatted}</li>
              <li><strong>Asistentes (${reservation.details.attendees.length}):</strong> ${reservation.details.attendees.join(', ')}</li>
            </ul>
            ${hotelHtmlSection}
            <p>¡Que tengas un excelente viaje!</p>
          </div>
          <div class="footer">
            <p>Sistema de Reserva de Flota</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 6. Definir los destinatarios del correo.
    const recipients = [reservation.details.email];
    if (reservation.hotelDetails && reservation.hotelDetails.required) {
        recipients.push('gruporecepcion@fyo.com');
    }

    // 7. Realizar la solicitud a la API de Resend para enviar el correo.
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Sistema de Reservas <onboarding@resend.dev>', // IMPORTANTE: Reemplazar con tu dominio verificado en Resend.
        to: recipients,
        subject: `Confirmación de Reserva: ${reservation.vehicleName}`,
        html: emailHtml,
      }),
    });

    // 8. Verificar la respuesta de Resend y manejar posibles errores.
    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Error al enviar el correo. Status:', resendResponse.status);
      console.error('Cuerpo del error de Resend:', errorBody);
      throw new Error(`Error de Resend: ${errorBody || 'Respuesta de error sin cuerpo.'}`);
    }

    // 9. Si todo sale bien, devolver una respuesta exitosa.
    return new Response(JSON.stringify({ message: 'Correo de confirmación enviado exitosamente.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 10. En caso de cualquier error durante el proceso, capturarlo y devolver una respuesta de error clara.
    console.error('Error en la función:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});