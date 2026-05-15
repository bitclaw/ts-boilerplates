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

  sortByPrice(products: Product[]): Product[] {
    return [...products].sort((a, b) => Number(a.price) - Number(b.price));
  }

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
