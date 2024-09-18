import { Model } from 'mongoose';
import { BaseRepository } from '../../../../core/engine';
import { IEntityModel } from '../types';

export class EntityRepository extends BaseRepository<IEntityModel> {
  constructor(model: Model<IEntityModel>) {
    super(model);
  }
}

export default EntityRepository;
