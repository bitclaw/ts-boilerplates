import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
@UseGuards(JwtAuthGuard)
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.blogsService.findAll(req.user.id);
  }

  // must come before :id to avoid route conflict
  @Get('search')
  search(@Query('q') q: string, @Request() req: { user: { id: string } }) {
    return this.blogsService.search(q ?? '', req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.blogsService.findOne(id, req.user.id);
  }

  @Post()
  create(
    @Body() dto: CreateBlogDto,
    @Request() req: { user: { id: string } }
  ) {
    return this.blogsService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @Request() req: { user: { id: string } }
  ) {
    return this.blogsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.blogsService.remove(id, req.user.id);
  }
}
