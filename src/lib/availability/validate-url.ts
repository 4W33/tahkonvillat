/** Hyväksyy vain https-osoitteet (Airbnb/Booking iCal-vienti on aina https). */
export function isValidIcalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}
