export interface Usecase<T, K = void> {
  call(input: T): Promise<K>;
}
