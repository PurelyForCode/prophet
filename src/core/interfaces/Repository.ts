export interface Repository<T> {
  delete(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  create(entity: T): Promise<void>;
}
