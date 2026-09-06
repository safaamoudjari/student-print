import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

const studentPayload = {
  firstName: 'Amina',
  lastName: 'Belkacem',
  email: 'amina@example.com',
  password: 'Strongpass1',
  phone: '0555123456',
  roomNumber: 'A-204',
};

describe('Auth', () => {
  it('registers a new student', async () => {
    const res = await request(app).post('/api/auth/register').send(studentPayload);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(studentPayload.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send(studentPayload);
    const res = await request(app).post('/api/auth/register').send(studentPayload);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(studentPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: studentPayload.email, password: studentPayload.password });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects incorrect password', async () => {
    await request(app).post('/api/auth/register').send(studentPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: studentPayload.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('blocks unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('blocks a student from accessing admin routes', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(studentPayload);
    const res = await agent.get('/api/admin/orders');
    expect(res.status).toBe(403);
  });
});
