import { Resend } from "resend";
import { BRAND_NAME, CONTACT_EMAIL } from "@/lib/constants";
import type { StoredContact } from "@/types/contact";
import type { StoredInquiry } from "@/types/inquiry";

const TOPIC_LABELS: Record<StoredContact["topic"], string> = {
  villa: "Villa",
  apartment: "Asunto",
  general: "Yleinen",
};

export type SendResult =
  | { sent: true }
  | { sent: false; reason: "missing_api_key" };

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.EMAIL_FROM || "Tahkon Villat <onboarding@resend.dev>";
}

/** Vastaanottaja: EMAIL_TO ympäristöstä, muuten site.configin yhteysosoite. */
function getToAddress() {
  return process.env.EMAIL_TO?.trim() || CONTACT_EMAIL;
}

async function deliver(
  resend: Resend,
  payload: { replyTo: string; subject: string; text: string },
): Promise<void> {
  // Resend palauttaa virheen { data, error } -muodossa eikä heitä → heitetään itse,
  // jotta kutsuja voi merkitä ilmoituksen epäonnistuneeksi.
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: getToAddress(),
    ...payload,
  });
  if (error) throw new Error(`Resend: ${error.name} — ${error.message}`);
}

export async function sendContactNotification(contact: StoredContact): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "missing_api_key" };

  const phoneLine = contact.phone ? `\nPuhelin: ${contact.phone}` : "";

  await deliver(resend, {
    replyTo: contact.email,
    subject: `[${BRAND_NAME}] Yhteydenotto: ${TOPIC_LABELS[contact.topic]}`,
    text: [
      `Uusi yhteydenotto sivustolta`,
      ``,
      `Nimi: ${contact.name}`,
      `Sähköposti: ${contact.email}${phoneLine}`,
      `Aihe: ${TOPIC_LABELS[contact.topic]}`,
      `Kieli: ${contact.locale}`,
      ``,
      `Viesti:`,
      contact.message,
    ].join("\n"),
  });

  return { sent: true };
}

export async function sendInquiryNotification(inquiry: StoredInquiry): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "missing_api_key" };

  const phoneLine = inquiry.phone ? `\nPuhelin: ${inquiry.phone}` : "";

  await deliver(resend, {
    replyTo: inquiry.email,
    subject: `[${BRAND_NAME}] Varausehdotus: ${inquiry.villaName}`,
    text: [
      `Uusi varausehdotus sivustolta`,
      ``,
      `Kohde: ${inquiry.villaName} (${inquiry.villaSlug})`,
      `Nimi: ${inquiry.name}`,
      `Sähköposti: ${inquiry.email}${phoneLine}`,
      `Saapuminen: ${inquiry.checkIn}`,
      `Lähtö: ${inquiry.checkOut}`,
      `Vieraita: ${inquiry.guests}`,
      `Kieli: ${inquiry.locale}`,
      ``,
      `Viesti:`,
      inquiry.message,
    ].join("\n"),
  });

  return { sent: true };
}

/** true = lähetetty · false = yritettiin, epäonnistui · null = ei konfiguroitu. */
export function toNotifiedFlag(result: SendResult): boolean | null {
  if (result.sent) return true;
  return result.reason === "missing_api_key" ? null : false;
}
