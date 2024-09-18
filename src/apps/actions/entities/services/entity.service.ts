import { BaseService } from '../../../../core/engine';
import { IEntityModel } from '../types';
import { EntityRepository } from '../repositories';
import { EntityModel } from '../models';

class EntityService extends BaseService<IEntityModel, EntityRepository> {
  constructor() {
    const entityRepo = new EntityRepository(EntityModel);
    super(entityRepo, true);
    this.searchFields = ['name', 'description'];
  }
}

export default new EntityService();
