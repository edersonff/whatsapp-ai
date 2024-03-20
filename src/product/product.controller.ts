import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CategoryService } from 'src/category/category.service';

@UseGuards(AuthGuard)
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    this.productService.setUserId(req.user.id);

    const { category } = createProductDto;

    const foundCategory = await this.findCategory(category);

    return this.productService.create({
      ...createProductDto,
      category: foundCategory,
    });
  }

  @Get()
  findAll(@Request() req) {
    this.productService.setUserId(req.user.id);

    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    this.productService.setUserId(req.user.id);

    return this.productService.findOne({ id: +id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    this.productService.setUserId(req.user.id);

    const { category } = updateProductDto;

    const foundCategory = await this.findCategory(category);

    return this.productService.update(+id, {
      ...updateProductDto,
      category: foundCategory,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    this.productService.setUserId(req.user.id);

    return this.productService.remove(+id);
  }

  private async findCategory(category: string) {
    const findCategory = await this.categoryService.findOne({
      name: category,
    });

    if (!findCategory) {
      throw new Error('Category not found');
    }

    return findCategory;
  }
}
