import type { Order, OrderStatus } from '../types';

// Read older browser data without keeping the retired fee or workflow.
export function normalizeOrder(order: Order): Order {
  const { deliveryFee: _retiredFee, ...saved } = order as Order & { deliveryFee?: number };
  const status = (value: string): OrderStatus => value === 'delivering_or_serving' ? 'serving_at_home' : value as OrderStatus;
  return {
    ...saved,
    serviceType: saved.serviceType === 'party_at_home' ? 'party_at_home' : 'cook_at_home',
    status: status(saved.status),
    statusHistory: saved.statusHistory.map((entry) => ({ ...entry, status: status(entry.status) })),
    finalPayableAmount: saved.actualGroceryTotal + saved.totalLaborFee + saved.additionalServiceFee,
  };
}
