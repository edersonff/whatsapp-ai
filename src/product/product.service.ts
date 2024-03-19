import { Injectable } from '@nestjs/common';
import { Service } from 'class/service/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService extends Service<Product> {
  constructor(
    @InjectRepository(Product)
    repository: Repository<Product>,
  ) {
    super(repository);
  }
}
