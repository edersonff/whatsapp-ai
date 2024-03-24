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
  private userId: number | undefined;
  constructor(private repository: Repository<Entity>) {}

  setUserId(userId: number) {
    if (!userId) {
      throw new Error('User id is required');
    }

    this.userId = userId;
  }

  findAll(options?: FindManyOptions<Entity>) {
    options = this.whereOptions(options);

    return this.repository.find(options);
  }

  findOne(options: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]) {
    options = this.whereOption(options);

    return this.repository.findOneBy(options);
  }

  findOneOrFail(options: FindOneOptions<Entity>) {
    options = this.whereOptions(options);

    return this.repository.findOneOrFail(options);
  }

  async create(data: DeepPartial<Entity>, options?: SaveOptions) {
    data = this.saveData(data);

    await this.repository.save(data, options);
  }

  async createMany(data: DeepPartial<Entity>[], options?: SaveOptions) {
    data = data.map((d) => this.saveData(d));

    await this.repository.save(data, options);
  }

  async upsert(
    data: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
    options?: string[] | UpsertOptions<Entity>,
  ) {
    data = this.whereUpsert(data);

    await this.repository.upsert(data, options);
  }

  async remove(criteria: Criteria) {
    criteria = this.whereCriteria(criteria);

    await this.repository.delete(criteria);
  }

  async clear() {
    await this.repository.clear();
  }

  async update(criteria: Criteria, data: QueryDeepPartialEntity<Entity>) {
    criteria = this.whereCriteria(criteria);

    await this.repository.update(criteria, data);
  }

  private whereOptions(options?: FindManyOptions<Entity>) {
    if (this.userId) {
      const where: any = options?.where || {};
      options.where = { ...where, user: { id: this.userId } };
    }
    return options;
  }

  private whereOption(
    options: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ) {
    if (this.userId) {
      const where: any = options || {};
      options = { ...where, user: { id: this.userId } };
    }
    return options;
  }

  private whereCriteria(criteria: Criteria) {
    if (this.userId) {
      if (typeof criteria === 'object') {
        criteria = { ...criteria, user: { id: this.userId } };
      } else {
        criteria = { id: criteria, user: { id: this.userId } };
      }
    }
    return criteria;
  }

  private whereUpsert(
    data: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
  ) {
    if (this.userId) {
      if (Array.isArray(data)) {
        data = data.map((d) => ({ ...d, user: { id: this.userId } }));
      } else {
        data = { ...data, user: { id: this.userId } };
      }
    }
    return data;
  }

  private saveData(data: DeepPartial<Entity>) {
    if (this.userId) {
      data = { ...data, user: { id: this.userId } };
    }
    return data;
  }
}
