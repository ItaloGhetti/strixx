const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

function getRedirectUri() {
  return `${process.env.APP_URL}/api/auth/google/callback`;
}

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function trocarCodigoPorTokens(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) throw new Error("Falha ao trocar código por tokens do Google");
  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}

export async function renovarAccessToken(refreshToken: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Falha ao renovar token do Google");
  return response.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function criarEventoNoCalendar(
  accessToken: string,
  evento: {
    titulo: string;
    descricao?: string;
    local?: string;
    dataHoraInicioISO: string;
    duracaoMinutos?: number;
  }
) {
  const inicio = new Date(evento.dataHoraInicioISO);
  const fim = new Date(inicio.getTime() + (evento.duracaoMinutos ?? 60) * 60 * 1000);

  const response = await fetch(GOOGLE_CALENDAR_EVENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: evento.titulo,
      description: evento.descricao ?? "",
      location: evento.local ?? "",
      start: { dateTime: inicio.toISOString() },
      end: { dateTime: fim.toISOString() },
    }),
  });

  if (!response.ok) throw new Error("Falha ao criar evento no Google Calendar");
  return response.json() as Promise<{ id: string }>;
}
