import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { CategoryName } from "./value_objects/CategoryName.js";

export class Category extends AggregateRoot {
  private constructor(
    id: EntityId,
    private _accountId: EntityId,
    private _name: CategoryName,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null
  ) {
    super(id);
  }

  public static create(
    id: EntityId,
    accountId: EntityId,
    name: CategoryName,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    return new Category(id, accountId, name, createdAt, updatedAt, deletedAt);
  }

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
  public set deletedAt(value: Date | null) {
    this._deletedAt = value;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public set updatedAt(value: Date) {
    this._updatedAt = value;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
  }
  public get name(): CategoryName {
    return this._name;
  }
  public set name(value: CategoryName) {
    this._name = value;
  }
  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
  }
}
