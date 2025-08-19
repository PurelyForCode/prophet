import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { InvalidSaleTargetException } from "../../../domain/sales/exceptions/InvalidSaleTargetException.js";
import { SaleNotFoundException } from "../../../domain/sales/exceptions/SaleNotFoundException.js";
import { SaleService } from "../../../domain/sales/services/SaleService.js";

export type ArchiveSaleInput = {
  saleId: EntityId;
  productId: EntityId;
};

export class ArchiveSaleUsecase implements Usecase<ArchiveSaleInput> {
  constructor(private readonly uow: IUnitOfWork) {}
  async call(input: ArchiveSaleInput): Promise<void> {
    const productRepo = this.uow.getProductRepository();
    const saleRepo = this.uow.getSaleRepository();
    const sale = await saleRepo.findById(input.saleId);
    if (!sale) {
      throw new SaleNotFoundException();
    }
    if (input.productId !== sale.getProductId()) {
      throw new InvalidSaleTargetException();
    }
    const saleService = new SaleService();
    saleService.archiveSale(sale);
  }
}
