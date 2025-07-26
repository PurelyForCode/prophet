import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { CreateVariantInput, CreateVariantUsecase } from "./Usecase.js";

export class CreateVariantController {
  private usecase: CreateVariantUsecase;
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly idGenerator: IIdGenerator
  ) {
    this.usecase = new CreateVariantUsecase(this.uow, this.idGenerator);
  }
  async handle(input: CreateVariantInput) {
    try {
      await this.uow.transaction();
      await this.usecase.call(input);
      await this.uow.commit();
      return this.present();
    } catch (error) {
      await this.uow.rollback();
    }
  }

  present() {
    return { message: "Successfully created variant" };
  }
}
