import { Resend } from "resend";
import { BRAND_NAME, CONTACT_EMAIL } from "@/lib/constants";
import type { StoredContact } from "@/types/contact";
import type { StoredInquiry } from "@/types/inquiry";

const TOPIC_LABELS: Record<StoredContact["topic"], string> = {
  villa: "Villa",
  apartment: "Asunto",
  general: "Yleinen",
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.EMAIL_FROM || "Tahkon Villat <onboarding@resend.dev>";
}

export async function sendContactNotification(contact: StoredContact) {
  const resend = getResend();
  if (!resend) return { sent: false as const, reason: "missing_api_key" };

  const phoneLine = contact.phone ? `\nPuhelin: ${contact.phone}` : "";

  await resend.emails.send({
    from: getFromAddress(),
    to: CONTACT_EMAIL,
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

  return { sent: true as const };
}

export async function sendInquiryNotification(inquiry: StoredInquiry) {
  const resend = getResend();
  if (!resend) return { sent: false as const, reason: "missing_api_key" };

  const phoneLine = inquiry.phone ? `\nPuhelin: ${inquiry.phone}` : "";

  await resend.emails.send({
    from: getFromAddress(),
    to: CONTACT_EMAIL,
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

  return { sent: true as const };
}
