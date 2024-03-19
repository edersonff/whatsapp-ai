import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  SaveOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class Service<Entity> {
  constructor(private repository: Repository<Entity>) {}

  findAll(options?: FindManyOptions<Entity>) {
    return this.repository.find(options);
  }

  findOne(options: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]) {
    return this.repository.findOneBy(options);
  }

  async create(data: DeepPartial<Entity>, options?: SaveOptions) {
    await this.repository.save(data, options);
  }

  async createMany(data: DeepPartial<Entity>[], options?: SaveOptions) {
    await this.repository.save(data, options);
  }

  async remove(id: number) {
    await this.repository.delete(id);
  }

  async update(id: number, data: QueryDeepPartialEntity<Entity>) {
    await this.repository.update(id, data);
  }
}
