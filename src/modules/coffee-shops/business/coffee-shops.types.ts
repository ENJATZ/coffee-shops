export interface CoffeeShopRecord {
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

export interface NearbyCoffeeShop extends CoffeeShopRecord {
  readonly distance: number;
}
