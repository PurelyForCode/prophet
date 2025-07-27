import { Knex } from "knex";
import {
  AggregateRoot,
  EntityAction,
} from "../../core/interfaces/AggregateRoot.js";
import {
  IsolationLevel,
  IUnitOfWork,
} from "../../core/interfaces/IUnitOfWork.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { RepositoryFactory } from "./RepositoryFactory.js";
import { SaleRepository } from "../repositories/SaleRepository.js";

export class UnitOfWork implements IUnitOfWork {
  private trx: Knex.Transaction | null = null;
  constructor(
    private readonly knex: Knex,
    private readonly repositoryFactory: RepositoryFactory
  ) {}

  getProductRepository() {
    if (this.trx) {
      return new ProductRepository(this.trx);
    } else {
      return new ProductRepository(this.knex);
    }
  }

  getSaleRepository() {
    if (this.trx) {
      return new SaleRepository(this.trx);
    } else {
      return new SaleRepository(this.knex);
    }
  }

  async transaction(
    config?: { isolationLevel: IsolationLevel } | undefined
  ): Promise<void> {
    if (this.trx) {
      throw new Error("Transaction already started");
    }
    const trx = await this.knex.transaction();
    this.trx = trx;
  }

  async rollback(): Promise<void> {
    if (!this.trx) {
      throw new Error("No transaction in progress");
    }
    await this.trx.rollback();
  }

  async commit(): Promise<void> {
    if (!this.trx) {
      throw new Error("No transaction in progress");
    }
    await this.trx.commit();
  }

  async save(aggregateRoot: AggregateRoot): Promise<void> {
    if (!this.trx) {
      throw new Error("Transaction not initialized. call transaction() first.");
    }
    const trackedEntities = aggregateRoot.getTrackedEntities();
    const values = trackedEntities.values();
    for (const trackedEntity of values) {
      const entity = trackedEntity.entity;
      const action = trackedEntity.action;
      const repo = this.repositoryFactory.getRepoOfEntity(
        entity.constructor,
        this.trx
      );
      if (action === EntityAction.created) {
        await repo.create(entity);
      } else if (action === EntityAction.deleted) {
        await repo.delete(entity);
      } else if (action === EntityAction.updated) {
        await repo.update(entity);
      }
    }
  }
}
export async function runInTransaction<T>(
  uow: IUnitOfWork,
  isolationLevel: IsolationLevel,
  fn: () => Promise<T>
) {
  try {
    await uow.transaction({ isolationLevel });
    const result = await fn();
    await uow.commit();
    return result;
  } catch (error) {
    await uow.rollback();
    throw error;
  }
}
