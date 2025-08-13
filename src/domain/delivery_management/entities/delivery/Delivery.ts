import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryItemNotFoundException } from "../../exceptions/DeliveryItemNotFoundException.js";
import { DuplicateDeliveryItemInDeliveryException } from "../../exceptions/DuplicateDeliveryItemInDeliveryException.js";
import {
  DeliveryItem,
  UpdateDeliveryItemFields,
} from "../delivery_item/DeliveryItem.js";
import { DeliveryStatus } from "./value_objects/DeliveryStatus.js";

export class Delivery extends AggregateRoot {
  private constructor(
    id: EntityId,
    private _supplierId: EntityId,
    private _accountId: EntityId,
    private _status: DeliveryStatus,
    private _completedAt: Date | null,
    private _deliveryRequestedAt: Date,
    private _scheduledArrivalDate: Date,
    private _cancelledAt: Date | null,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    private _items: Map<EntityId, DeliveryItem>
  ) {
    super(id);
  }

  public static create(
    id: EntityId,
    supplierId: EntityId,
    accountId: EntityId,
    status: DeliveryStatus,
    completedAt: Date | null,
    scheduledArrivalDate: Date,
    deliveryRequestedAt: Date,
    cancelledAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    items: Map<EntityId, DeliveryItem>
  ) {
    return new Delivery(
      id,
      supplierId,
      accountId,
      status,
      completedAt,
      scheduledArrivalDate,
      deliveryRequestedAt,
      cancelledAt,
      createdAt,
      updatedAt,
      deletedAt,
      items
    );
  }

  arrived(date?: Date) {
    if (date) {
      this._completedAt = date;
    } else {
      this._completedAt = new Date();
    }
    this.addTrackedEntity(this, EntityAction.updated);
  }

  cancel(date?: Date) {
    if (date) {
      this._cancelledAt = date;
    } else {
      this._cancelledAt = new Date();
    }
    this.addTrackedEntity(this, EntityAction.updated);
  }

  archive() {
    this._deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
  }

  addItem(item: DeliveryItem) {
    if (this._items.has(item.id)) {
      throw new DuplicateDeliveryItemInDeliveryException();
    }
    //check for duplication
    this._items.set(item.id, item);
    this.addTrackedEntity(item, EntityAction.created);
  }

  removeItem(deliveryItemId: EntityId) {
    const item = this._items.get(deliveryItemId);
    if (!item) {
      throw new DeliveryItemNotFoundException();
    }
    this._items.delete(deliveryItemId);
    this.addTrackedEntity(item, EntityAction.deleted);
  }

  updateItem(itemId: EntityId, fields: UpdateDeliveryItemFields) {
    const existingItem = this._items.get(itemId);
    if (!existingItem) {
      throw new DeliveryItemNotFoundException();
    }
    if (fields.quantity) {
      existingItem.quantity = fields.quantity;
    }
    this._updatedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
    this.addTrackedEntity(existingItem, EntityAction.updated);
  }

  public get supplierId(): EntityId {
    return this._supplierId;
  }
  public set supplierId(value: EntityId) {
    this._supplierId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get status(): DeliveryStatus {
    return this._status;
  }
  public set status(value: DeliveryStatus) {
    this._status = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get completedAt(): Date | null {
    return this._completedAt;
  }
  public set completedAt(value: Date | null) {
    this._completedAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get deliveryRequestedAt(): Date {
    return this._deliveryRequestedAt;
  }
  public set deliveryRequestedAt(value: Date) {
    this._deliveryRequestedAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get cancelledAt(): Date | null {
    return this._cancelledAt;
  }
  public set cancelledAt(value: Date | null) {
    this._cancelledAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public set updatedAt(value: Date) {
    this._updatedAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
  public set deletedAt(value: Date | null) {
    this._deletedAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get scheduledArrivalDate(): Date {
    return this._scheduledArrivalDate;
  }
  public set scheduledArrivalDate(value: Date) {
    this._scheduledArrivalDate = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
}
