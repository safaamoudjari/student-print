import { calculatePrice } from '../src/utils/priceCalculator';
import { IService } from '../src/models/Service';

function fakeService(overrides: Partial<IService>): IService {
  return {
    _id: overrides._id || ({ toString: () => 'svc1' } as any),
    name: 'Service',
    type: 'flat',
    price: 0,
    unit: 'DA',
    isActive: true,
    isCore: false,
    ...overrides,
  } as IService;
}

describe('calculatePrice', () => {
  const bw = fakeService({ type: 'per_page_bw', price: 5, name: 'Black & White' });
  const color = fakeService({ type: 'per_page_color', price: 25, name: 'Color' });
  const binding = fakeService({
    _id: { toString: () => 'binding-id' } as any,
    type: 'flat',
    price: 50,
    name: 'Binding',
  });

  it('calculates black & white pricing correctly', () => {
    const result = calculatePrice([bw, color], {
      totalPages: 10,
      colorMode: 'bw',
      copies: 2,
      selectedServices: [],
    });
    expect(result.printingPrice).toBe(100); // 10 * 5 * 2
    expect(result.totalPrice).toBe(100);
  });

  it('calculates color pricing correctly', () => {
    const result = calculatePrice([bw, color], {
      totalPages: 10,
      colorMode: 'color',
      copies: 1,
      selectedServices: [],
    });
    expect(result.printingPrice).toBe(250); // 10 * 25 * 1
  });

  it('adds additional services on top of printing price', () => {
    const result = calculatePrice([bw, color, binding], {
      totalPages: 10,
      colorMode: 'bw',
      copies: 1,
      selectedServices: [{ service: binding, quantity: 1 }],
    });
    expect(result.printingPrice).toBe(50);
    expect(result.servicesPrice).toBe(50);
    expect(result.totalPrice).toBe(100);
  });

  it('ignores inactive services', () => {
    const inactiveBinding = fakeService({ type: 'flat', price: 50, isActive: false });
    const result = calculatePrice([bw], {
      totalPages: 5,
      colorMode: 'bw',
      copies: 1,
      selectedServices: [{ service: inactiveBinding, quantity: 1 }],
    });
    expect(result.servicesPrice).toBe(0);
  });
});
