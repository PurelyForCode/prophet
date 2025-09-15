import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SaleQuantity } from "../../../domain/sales/entities/sale/value_objects/SaleQuantity.js";
import {
  SaleStatus,
  SaleStatusValues,
} from "../../../domain/sales/entities/sale/value_objects/SaleStatus.js";
import { SaleService } from "../../../domain/sales/services/SaleService.js";

export type CreateSaleInput = {
  accountId: EntityId;
  productId: EntityId;
  quantity: number;
  status: SaleStatusValues;
  date: Date;
};

export class CreateSaleUsecase implements Usecase<CreateSaleInput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly idGenerator: IIdGenerator
  ) {}
  async call(input: CreateSaleInput) {
    const saleService = new SaleService();
    const now = new Date();
    const quantity = new SaleQuantity(input.quantity);
    const status = new SaleStatus(input.status);
    const sale = saleService.createSale({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      productId: input.productId,
      quantity: quantity,
      status: status,
      date: input.date,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    await this.uow.save(sale);
  }
}
