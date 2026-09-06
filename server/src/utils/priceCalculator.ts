import { IService } from '../models/Service';

export interface PriceInput {
  totalPages: number;
  colorMode: 'bw' | 'color';
  copies: number;
  selectedServices: { service: IService; quantity: number }[];
}

export interface PriceResult {
  printingPrice: number;
  servicesPrice: number;
  totalPrice: number;
  breakdownLines: string[];
  appliedServices: { serviceId: string; name: string; price: number; quantity: number }[];
}

// This is the single source of truth for pricing. The frontend may show a
// live preview, but the backend always recalculates from the current
// database prices + real file data before an order is persisted, so a
// student can never manipulate the total via dev tools.
export function calculatePrice(
  services: IService[],
  input: PriceInput
): PriceResult {
  const perPageService = services.find(
    (s) => s.type === (input.colorMode === 'bw' ? 'per_page_bw' : 'per_page_color') && s.isActive
  );
  const pricePerPage = perPageService?.price ?? 0;

  const printingPrice = input.totalPages * pricePerPage * input.copies;

  const breakdownLines: string[] = [
    `${input.totalPages} page${input.totalPages === 1 ? '' : 's'} x ${pricePerPage} DA (${
      input.colorMode === 'bw' ? 'Black & White' : 'Color'
    }) x ${input.copies} cop${input.copies === 1 ? 'y' : 'ies'} = ${printingPrice} DA`,
  ];

  let servicesPrice = 0;
  const appliedServices: PriceResult['appliedServices'] = [];

  for (const { service, quantity } of input.selectedServices) {
    if (!service.isActive) continue;
    const qty = Math.max(1, quantity);
    const cost = service.price * qty;
    servicesPrice += cost;
    appliedServices.push({
      serviceId: service._id.toString(),
      name: service.name,
      price: service.price,
      quantity: qty,
    });
    breakdownLines.push(`${service.name} x ${qty} = ${cost} DA`);
  }

  const totalPrice = printingPrice + servicesPrice;
  breakdownLines.push(`Total = ${totalPrice} DA`);

  return { printingPrice, servicesPrice, totalPrice, breakdownLines, appliedServices };
}
