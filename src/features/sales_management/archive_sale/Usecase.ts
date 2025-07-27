import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { InvalidSaleTargetException } from "../../../domain/sales/exceptions/InvalidSaleTargetException.js";
import { SaleNotFoundException } from "../../../domain/sales/exceptions/SaleNotFoundException.js";
import { SaleService } from "../../../domain/sales/services/SaleService.js";

export type ArchiveSaleInput = {
  saleId: EntityId;
  productId: EntityId;
  variantId: EntityId | null;
};

export class ArchiveSaleUsecase implements Usecase<ArchiveSaleInput> {
  constructor(private readonly uow: IUnitOfWork) {}
  async call(input: ArchiveSaleInput): Promise<void> {
    const saleRepo = this.uow.getSaleRepository();
    const sale = await saleRepo.findById(input.saleId);
    if (!sale) {
      throw new SaleNotFoundException();
    }
    if (input.productId !== sale.productId) {
      throw new InvalidSaleTargetException();
    }
    if (input.variantId !== sale.variantId) {
      throw new InvalidSaleTargetException();
    }
    const saleService = new SaleService();
    saleService.archiveSale(sale);
  }
}
