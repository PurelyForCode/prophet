import { IRepository } from "../../../core/interfaces/Repository.js";
import { Variant } from "../entities/variant/Variant.js";

export interface IVariantRepository extends IRepository<Variant> {}
