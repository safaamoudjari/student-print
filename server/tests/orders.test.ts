import request from 'supertest';
import { createApp } from '../src/app';
import { Service } from '../src/models/Service';

const app = createApp();

async function registerStudent(email: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    firstName: 'Sara',
    lastName: 'Amrani',
    email,
    password: 'Strongpass1',
    phone: '0555111222',
    roomNumber: 'B-101',
  });
  return agent;
}

async function seedServices() {
  await Service.create([
    { name: 'Black & White Printing', type: 'per_page_bw', price: 5, unit: 'DA/page', isCore: true },
    { name: 'Color Printing', type: 'per_page_color', price: 25, unit: 'DA/page', isCore: true },
  ]);
}

describe('Orders', () => {
  beforeEach(seedServices);

  it('rejects order creation with no files', async () => {
    const agent = await registerStudent('student1@example.com');
    const res = await agent
      .post('/api/orders')
      .field('colorMode', 'bw')
      .field('sides', 'single')
      .field('copies', '1');
    expect(res.status).toBe(400);
  });

  it('rejects unsupported file types', async () => {
    const agent = await registerStudent('student2@example.com');
    const res = await agent
      .post('/api/orders')
      .field('colorMode', 'bw')
      .field('sides', 'single')
      .field('copies', '1')
      .attach('files', Buffer.from('not really an exe'), 'virus.exe');
    expect(res.status).toBe(400);
  });

  it('creates an order and calculates the backend-authoritative price', async () => {
    const agent = await registerStudent('student3@example.com');
    const res = await agent
      .post('/api/orders')
      .field('colorMode', 'bw')
      .field('sides', 'single')
      .field('copies', '2')
      .attach('files', Buffer.from('%PDF-1.4 fake'), 'notes.pdf');

    expect(res.status).toBe(201);
    expect(res.body.order.status).toBe('pending');
    expect(res.body.order.orderNumber).toMatch(/^PR-\d{4}-\d{5}$/);
    // Fallback page count for an unparsable fake PDF is 1 page.
    expect(res.body.order.totalPrice).toBe(1 * 5 * 2);
  });

  it('prevents a student from viewing another student order', async () => {
    const agentA = await registerStudent('studentA@example.com');
    const agentB = await registerStudent('studentB@example.com');

    const createRes = await agentA
      .post('/api/orders')
      .field('colorMode', 'bw')
      .field('sides', 'single')
      .field('copies', '1')
      .attach('files', Buffer.from('%PDF-1.4 fake'), 'file.pdf');

    const orderId = createRes.body.order._id;
    const res = await agentB.get(`/api/orders/${orderId}`);
    expect(res.status).toBe(404);
  });

  it('allows cancelling a pending order but not twice', async () => {
    const agent = await registerStudent('student4@example.com');
    const createRes = await agent
      .post('/api/orders')
      .field('colorMode', 'bw')
      .field('sides', 'single')
      .field('copies', '1')
      .attach('files', Buffer.from('%PDF-1.4 fake'), 'file.pdf');

    const orderId = createRes.body.order._id;
    const cancelRes = await agent.post(`/api/orders/${orderId}/cancel`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.status).toBe('cancelled');

    const secondCancel = await agent.post(`/api/orders/${orderId}/cancel`);
    expect(secondCancel.status).toBe(400);
  });
});
