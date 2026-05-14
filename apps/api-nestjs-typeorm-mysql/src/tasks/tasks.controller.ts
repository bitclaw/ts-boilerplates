import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import type { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @Request() req: { user: { id: string } }
  ) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req: { user: { id: string } }
  ) {
    return this.tasksService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tasksService.remove(id, req.user.id);
  }
}
