import { Document } from 'mongoose';
import { IBaseModel } from '../../../../core/engine';

export interface IEntity extends IBaseModel {
  name: string;
  description?: string;
  slug: string;
  active: boolean;
}

export interface IEntityModel extends IEntity, IBaseModel, Document {}
