export function PriceBreakdown({
  totalPages,
  colorMode,
  pricePerPage,
  copies,
  printingPrice,
  services,
  totalPrice,
}: {
  totalPages: number;
  colorMode: 'bw' | 'color';
  pricePerPage: number;
  copies: number;
  printingPrice: number;
  services: { name: string; price: number; quantity: number }[];
  totalPrice: number;
}) {
  return (
    <div className="rounded-3xl border border-blush-100 bg-white p-5">
      <h3 className="mb-3 font-display text-base font-semibold text-ink-700">How this was calculated</h3>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-ink-500">
          <span>
            {totalPages} page{totalPages === 1 ? '' : 's'} × {pricePerPage} DA ({colorMode === 'bw' ? 'Black & White' : 'Color'}) × {copies} cop{copies === 1 ? 'y' : 'ies'}
          </span>
          <span className="font-bold text-ink-700">{printingPrice} DA</span>
        </div>
        {services.map((s) => (
          <div key={s.name} className="flex justify-between text-ink-500">
            <span>
              {s.name} × {s.quantity}
            </span>
            <span className="font-bold text-ink-700">{s.price * s.quantity} DA</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-dashed border-blush-200 pt-3 font-display text-lg font-semibold text-rose-600">
          <span>Total</span>
          <span>{totalPrice} DA</span>
        </div>
      </div>
    </div>
  );
}
