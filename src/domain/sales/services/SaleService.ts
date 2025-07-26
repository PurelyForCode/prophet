import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { Sale, SaleUpdateableFields } from "../entities/sale/Sale.js";
import { SaleQuantity } from "../entities/sale/value_objects/SaleQuantity.js";
import { SaleStatus } from "../entities/sale/value_objects/SaleStatus.js";

export class SaleService {
  createSale(
    id: EntityId,
    accountId: EntityId,
    productId: EntityId,
    variantId: EntityId | null,
    quantity: SaleQuantity,
    status: SaleStatus,
    date: Date,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    const sale = Sale.create(
      id,
      accountId,
      productId,
      variantId,
      quantity,
      status,
      date,
      createdAt,
      updatedAt,
      deletedAt
    );
    sale.addTrackedEntity(sale, EntityAction.created);
    return sale;
  }

  updateSale(input: SaleUpdateableFields, sale: Sale) {
    if (input.date) {
      sale.date = input.date;
    }
    if (input.quantity) {
      sale.quantity = input.quantity;
    }
    if (input.status) {
      sale.status = input.status;
    }
    sale.updatedAt = new Date();
  }

  deleteSale(sale: Sale) {
    sale.delete();
  }
  archiveSale(sale: Sale) {
    sale.archive();
  }
}
