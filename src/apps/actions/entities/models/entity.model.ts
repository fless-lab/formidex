import { BaseModel, createBaseSchema } from '../../../../core/engine';
import { IEntityModel } from '../types';

const ENTITY_MODEL_NAME = 'Entity';

const EntitySchema = createBaseSchema<IEntityModel>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: false },
    active: { type: Boolean, default: true },
  },
  {
    modelName: ENTITY_MODEL_NAME,
  },
);

const EntityModel = new BaseModel<IEntityModel>(
  ENTITY_MODEL_NAME,
  EntitySchema,
).getModel();

export default EntityModel;
