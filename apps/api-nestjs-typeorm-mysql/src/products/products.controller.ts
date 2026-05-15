import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── GAP exercise endpoints (all before :id to avoid route conflict) ───────

  // 1. List products ordered by title (localeCompare)
  @Get('by-title')
  findAllByTitle() {
    return this.productsService.findAllByTitle();
  }

  // 2. List unique product categories
  @Get('categories')
  findCategories() {
    return this.productsService.findCategories();
  }

  // 3. Top 10 products by price (most expensive)
  @Get('top')
  findTop10() {
    return this.productsService.findTop10();
  }

  // 4. Top category by avg rating rate and total count
  @Get('top-category')
  findTopCategory() {
    return this.productsService.findTopCategory();
  }

  // 5. Cheapest and most expensive product
  @Get('price-range')
  findPriceRange() {
    return this.productsService.findPriceRange();
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('sort') sort?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20'
  ) {
    return this.productsService.findAll(sort, Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
