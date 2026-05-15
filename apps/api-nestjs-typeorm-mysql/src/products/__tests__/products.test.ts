import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../../test/app';
import { cleanDb, createProduct } from '../../test/helpers';

let app: INestApplication;

beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await app.close();
});

afterEach(() => cleanDb(app));

describe('POST /api/products', () => {
  it('returns 201 with created product', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'Widget', price: 9.99 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Widget');
    expect(Number(res.body.price)).toBe(9.99);
  });

  it('returns 400 on missing name', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send({ price: 9.99 });

    expect(res.status).toBe(400);
  });

  it('returns 400 on negative price', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'Bad', price: -1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/products', () => {
  it('returns 200 with data and meta', async () => {
    await createProduct(app, { name: 'A', price: 10 });
    await createProduct(app, { name: 'B', price: 20 });

    const res = await request(app.getHttpServer()).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('?sort=price returns ascending order', async () => {
    await createProduct(app, { name: 'Expensive', price: 100 });
    await createProduct(app, { name: 'Cheap', price: 5 });

    const res = await request(app.getHttpServer()).get('/api/products?sort=price');

    expect(res.status).toBe(200);
    expect(Number(res.body.data[0].price)).toBe(5);
    expect(Number(res.body.data[1].price)).toBe(100);
  });
});

describe('GET /api/products/by-title', () => {
  it('returns products sorted alphabetically', async () => {
    await createProduct(app, { name: 'Zebra' });
    await createProduct(app, { name: 'Apple' });
    await createProduct(app, { name: 'Mango' });

    const res = await request(app.getHttpServer()).get('/api/products/by-title');

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Apple');
    expect(res.body[1].name).toBe('Mango');
    expect(res.body[2].name).toBe('Zebra');
  });
});

describe('GET /api/products/categories', () => {
  it('returns unique categories', async () => {
    await createProduct(app, { name: 'A', category: 'electronics' });
    await createProduct(app, { name: 'B', category: 'electronics' });
    await createProduct(app, { name: 'C', category: 'clothing' });

    const res = await request(app.getHttpServer()).get('/api/products/categories');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body).toEqual(expect.arrayContaining(['electronics', 'clothing']));
  });
});

describe('GET /api/products/top', () => {
  it('returns at most 10 products sorted by price DESC', async () => {
    for (let i = 1; i <= 12; i++) {
      await createProduct(app, { name: `Product ${i}`, price: i * 10 });
    }

    const res = await request(app.getHttpServer()).get('/api/products/top');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(Number(res.body[0].price)).toBe(120); // most expensive first
  });
});

describe('GET /api/products/top-category', () => {
  it('returns category with highest avg rating', async () => {
    await createProduct(app, { name: 'A', category: 'electronics', ratingRate: 4.8, ratingCount: 100 });
    await createProduct(app, { name: 'B', category: 'electronics', ratingRate: 4.2, ratingCount: 200 });
    await createProduct(app, { name: 'C', category: 'clothing', ratingRate: 2.0, ratingCount: 50 });

    const res = await request(app.getHttpServer()).get('/api/products/top-category');

    expect(res.status).toBe(200);
    expect(res.body.category).toBe('electronics');
    expect(res.body.avgRate).toBeDefined();
    expect(res.body.totalCount).toBeDefined();
  });
});

describe('GET /api/products/price-range', () => {
  it('returns cheapest and most expensive product', async () => {
    await createProduct(app, { name: 'Budget', price: 1.99 });
    await createProduct(app, { name: 'Mid', price: 50 });
    await createProduct(app, { name: 'Premium', price: 999 });

    const res = await request(app.getHttpServer()).get('/api/products/price-range');

    expect(res.status).toBe(200);
    expect(res.body.cheapest.name).toBe('Budget');
    expect(res.body.expensive.name).toBe('Premium');
  });
});

describe('GET /api/products/:id', () => {
  it('returns 200 with product', async () => {
    const product = await createProduct(app, { name: 'Find me' });

    const res = await request(app.getHttpServer()).get(`/api/products/${product.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(product.id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/products/00000000-0000-0000-0000-000000000000'
    );
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/products/:id', () => {
  it('returns 200 with updated product', async () => {
    const product = await createProduct(app, { name: 'Old', price: 10 });

    const res = await request(app.getHttpServer())
      .patch(`/api/products/${product.id}`)
      .send({ name: 'New', price: 20 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
    expect(Number(res.body.price)).toBe(20);
  });
});

describe('DELETE /api/products/:id', () => {
  it('returns 204', async () => {
    const product = await createProduct(app);

    const res = await request(app.getHttpServer()).delete(`/api/products/${product.id}`);

    expect(res.status).toBe(204);
  });
});
