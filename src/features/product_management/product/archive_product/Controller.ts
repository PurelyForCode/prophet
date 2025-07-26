import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { ArchiveProductInput, ArchiveProductUsecase } from "./Usecase.js";

export class ArchiveProductController {
  private readonly usecase: ArchiveProductUsecase;
  constructor(private readonly uow: IUnitOfWork) {
    this.usecase = new ArchiveProductUsecase(this.uow);
  }

  async handle(input: ArchiveProductInput) {
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
      message: "Successfully archived product",
    };
  }
}
