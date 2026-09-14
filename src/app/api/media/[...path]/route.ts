import { getBlobClient } from "@/lib/storage/blob-client";
import { isAllowedMediaPathname, isBlobStorageEnabled } from "@/lib/storage/config";

type RouteContext = { params: { path: string[] } };

/**
 * Näyttää adminissa ladatun kuvan yksityisestä Blob-säilöstä.
 *
 * Samassa säilössä on myös lomakeviestejä ja varauksia, joten reitti päästää läpi
 * VAIN polut muotoa media/properties/<kohde>/<tiedosto>.<kuvapääte>. Tiedostonimet
 * ovat UUID:itä, eikä samaa nimeä käytetä uudelleen, joten vastauksen voi
 * välimuistittaa pysyvästi. Kuvat ovat julkisen sivuston sisältöä, eivät henkilötietoa.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const pathname = `media/${(params.path ?? []).join("/")}`;

  if (!isAllowedMediaPathname(pathname) || !isBlobStorageEnabled()) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { get } = await getBlobClient();
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
