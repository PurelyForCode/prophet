import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SaleUpdateableFields } from "../../../domain/sales/entities/sale/Sale.js";
import { SaleQuantity } from "../../../domain/sales/entities/sale/value_objects/SaleQuantity.js";
import { SaleStatus } from "../../../domain/sales/entities/sale/value_objects/SaleStatus.js";
import { InvalidSaleTargetException } from "../../../domain/sales/exceptions/InvalidSaleTargetException.js";
import { SaleNotFoundException } from "../../../domain/sales/exceptions/SaleNotFoundException.js";
import { SaleService } from "../../../domain/sales/services/SaleService.js";

type UpdateSaleInput = {
  fields: Partial<{
    quantity: number;
    status: string;
    date: Date;
  }>;
  saleId: EntityId;
  productId: EntityId;
};

export class UpdateSaleUsecase implements Usecase<UpdateSaleInput> {
  constructor(private readonly uow: IUnitOfWork) {}
  async call(input: UpdateSaleInput) {
    const saleRepo = this.uow.getSaleRepository();
    const sale = await saleRepo.findById(input.saleId);
    if (!sale) {
      throw new SaleNotFoundException();
    }

    if (input.productId !== sale.getProductId()) {
      throw new InvalidSaleTargetException();
    }
    const saleService = new SaleService();
    let date = undefined;
    let quantity = undefined;
    let status = undefined;

    if (input.fields.date) {
      date = input.fields.date;
    }
    if (input.fields.quantity) {
      quantity = new SaleQuantity(input.fields.quantity);
    }
    if (input.fields.status) {
      status = new SaleStatus(input.fields.status);
    }

    saleService.updateSale(
      {
        date,
        quantity,
        status,
      },
      sale
    );
    await this.uow.save(sale);
  }
}
