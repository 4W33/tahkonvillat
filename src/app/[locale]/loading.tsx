/** Näkyy heti sivusiirrossa, kun kohdesivu (esim. asunnot, yhteystiedot) renderöidään palvelimella. */
export default function Loading() {
  return (
    <div aria-busy="true" className="min-h-[70vh]">
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden">
        <div className="h-full w-1/3 animate-loading-bar bg-gold motion-reduce:w-full motion-reduce:animate-none" />
      </div>
    </div>
  );
}
