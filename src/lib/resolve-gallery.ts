export function resolveGallery(
  image: string,
  gallery?: string[] | null,
): string[] {
  if (gallery?.length) return gallery;
  return image ? [image] : [];
}
