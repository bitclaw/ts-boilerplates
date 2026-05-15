import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly _repo: Repository<Product>
  ) {}

  // ── sorting algorithm (testable) ─────────────────────────────────────────

  sortByPrice(products: Product[]): Product[] {
    return [...products].sort((a, b) => Number(a.price) - Number(b.price));
  }

  // ── GAP exercise endpoints ────────────────────────────────────────────────

  async findAllByTitle(): Promise<Product[]> {
    const products = await this._repo.find();
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findCategories(): Promise<string[]> {
    const products = await this._repo.find({ select: ['category'] });
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }

  async findTop10(): Promise<Product[]> {
    const products = await this._repo.find();
    return [...products]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 10);
  }

  async findTopCategory(): Promise<{ category: string; avgRate: number; totalCount: number }> {
    const products = await this._repo.find();

    const grouped = products.reduce<Record<string, { rate: number; count: number; total: number }>>(
      (acc, p) => {
        if (!p.category) return acc;
        if (!acc[p.category]) acc[p.category] = { rate: 0, count: 0, total: 0 };
        acc[p.category].rate += Number(p.ratingRate ?? 0);
        acc[p.category].count += Number(p.ratingCount ?? 0);
        acc[p.category].total += 1;
        return acc;
      },
      {}
    );

    const summary = Object.entries(grouped).map(([category, data]) => ({
      category,
      avgRate: parseFloat((data.rate / data.total).toFixed(2)),
      totalCount: data.count
    }));

    return summary.reduce((best, current) =>
      current.avgRate > best.avgRate ? current : best
    );
  }

  async findPriceRange(): Promise<{ cheapest: Product; expensive: Product }> {
    const products = await this._repo.find();
    const expensive = products.reduce((max, p) => (Number(p.price) > Number(max.price) ? p : max));
    const cheapest = products.reduce((min, p) => (Number(p.price) < Number(min.price) ? p : min));
    return { cheapest, expensive };
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async findAll(sort?: string, page = 1, limit = 20): Promise<{ data: Product[]; meta: object }> {
    const [items, total] = await this._repo.findAndCount({
      order: sort === 'price' ? { price: 'ASC' } : { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit
    });
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this._repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    const product = this._repo.create(dto);
    return this._repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this._repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this._repo.remove(product);
  }
}
