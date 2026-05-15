import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, type Repository } from 'typeorm';
import { Blog } from './blog.entity';
import type { CreateBlogDto } from './dto/create-blog.dto';
import type { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private readonly _repo: Repository<Blog>
  ) {}

  findAll(authorId: string): Promise<Blog[]> {
    return this._repo.find({ where: { authorId }, order: { createdAt: 'DESC' } });
  }

  search(q: string, authorId: string): Promise<Blog[]> {
    return this._repo.find({
      where: [
        { title: Like(`%${q}%`), authorId },
        { description: Like(`%${q}%`), authorId }
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, authorId: string): Promise<Blog> {
    const blog = await this._repo.findOne({ where: { id, authorId } });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  create(dto: CreateBlogDto, authorId: string): Promise<Blog> {
    const blog = this._repo.create({ ...dto, authorId });
    return this._repo.save(blog);
  }

  async update(id: string, dto: UpdateBlogDto, authorId: string): Promise<Blog> {
    const blog = await this.findOne(id, authorId);
    Object.assign(blog, dto);
    return this._repo.save(blog);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const blog = await this.findOne(id, authorId);
    await this._repo.remove(blog);
  }
}
