import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { UpdateProductInput, UpdateProductUsecase } from "./Usecase.js";

export class UpdateProductController {
  private readonly usecase: UpdateProductUsecase;
  constructor(private readonly uow: IUnitOfWork) {
    this.usecase = new UpdateProductUsecase(this.uow);
  }

  async handle(input: UpdateProductInput) {
    try {
      await this.uow.transaction();
      await this.usecase.call(input);
      await this.uow.commit();
      return this.present();
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  present() {
    return {
      message: "Successfully updated product",
    };
  }
}
