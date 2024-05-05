import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
  Repository,
  SaveOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

type Criteria =
  | string
  | string[]
  | number
  | number[]
  | Date
  | Date[]
  | ObjectId
  | ObjectId[]
  | FindOptionsWhere<any>;

@Injectable()
export class Service<Entity> {
  constructor(private repository: Repository<Entity>) {}

  findAll(options?: FindManyOptions<Entity>) {
    return this.repository.find(options);
  }

  findOne(options: FindOneOptions) {
    return this.repository.findOne(options);
  }

  findOneOrFail(options: FindOneOptions<Entity>) {
    return this.repository.findOneOrFail(options);
  }

  async create(data: DeepPartial<Entity>, options?: SaveOptions) {
    await this.repository.save(data, options);
  }

  async createMany(data: DeepPartial<Entity>[], options?: SaveOptions) {
    await this.repository.save(data, options);
  }

  async upsert(
    data: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
    options?: string[] | UpsertOptions<Entity>,
  ) {
    await this.repository.upsert(data, options);
  }

  async remove(criteria: Criteria) {
    await this.repository.delete(criteria);
  }

  async clear() {
    await this.repository.clear();
  }

  async update(criteria: Criteria, data: QueryDeepPartialEntity<Entity>) {
    await this.repository.update(criteria, data);
  }
}
