import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';

export default class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Category);
    await repository.insert([
      { label: 'Entretenimento', name: 'entertainment' },
      { label: 'Engraçado', name: 'funny' },
      { label: 'Curiosidades', name: 'curiosities' },
      { label: 'Notícias', name: 'news' },
      { label: 'Viral', name: 'viral' },
      { label: 'Tutorial', name: 'tutorial' },
    ]);
  }
}
