import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { CreateProductInput, CreateProductUsecase } from "./Usecase.js";

export class CreateProductController {
  private readonly usecase: CreateProductUsecase;
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly idGenerator: IIdGenerator
  ) {
    this.usecase = new CreateProductUsecase(this.uow);
  }

  async handle(input: Omit<CreateProductInput, "id">) {
    try {
      await this.uow.transaction();
      const id = this.idGenerator.generate();
      let settings;
      if (input.settings) {
        settings = {
          classification: input.settings.classification,
          fillRate: input.settings.fillRate,
          safetyStockCalculationMethod:
            input.settings.safetyStockCalculationMethod,
          serviceLevel: input.settings.serviceLevel,
        };
      }
      await this.usecase.call({
        accountId: input.accountId,
        id: id,
        name: input.name,
        productCategoryId: input.productCategoryId,
        settings: settings,
      });
      await this.uow.commit();
      return this.present();
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  present() {
    return {
      message: "Successfully created product",
    };
  }
}
