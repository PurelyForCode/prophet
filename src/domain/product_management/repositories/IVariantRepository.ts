import { Repository } from "../../../core/interfaces/Repository.js";
import { Variant } from "../entities/variant/Variant.js";

export interface IVariantRepository extends Repository<Variant> {}
