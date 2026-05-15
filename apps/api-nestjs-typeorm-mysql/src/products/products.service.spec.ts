import { ProductsService } from './products.service';
import type { Product } from './product.entity';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService(mockRepo as any);
  });

  describe('sortByPrice', () => {
    const makeProduct = (price: number) =>
      ({ id: String(price), name: `Product ${price}`, price } as Product);

    it('sorts ascending by price', () => {
      const products = [makeProduct(30), makeProduct(10), makeProduct(20)];
      const sorted = service.sortByPrice(products);
      expect(sorted.map(p => p.price)).toEqual([10, 20, 30]);
    });

    it('handles already-sorted list', () => {
      const products = [makeProduct(1), makeProduct(2), makeProduct(3)];
      const sorted = service.sortByPrice(products);
      expect(sorted.map(p => p.price)).toEqual([1, 2, 3]);
    });

    it('handles single product', () => {
      const products = [makeProduct(99)];
      const sorted = service.sortByPrice(products);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].price).toBe(99);
    });

    it('handles empty list', () => {
      expect(service.sortByPrice([])).toEqual([]);
    });

    it('handles equal prices (stable order)', () => {
      const products = [makeProduct(10), makeProduct(10), makeProduct(5)];
      const sorted = service.sortByPrice(products);
      expect(sorted[0].price).toBe(5);
      expect(sorted[1].price).toBe(10);
      expect(sorted[2].price).toBe(10);
    });

    it('does not mutate original array', () => {
      const products = [makeProduct(30), makeProduct(10)];
      service.sortByPrice(products);
      expect(products[0].price).toBe(30);
    });
  });
});
