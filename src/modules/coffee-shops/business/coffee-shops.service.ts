import { Injectable } from '@nestjs/common';

import { CoffeeShopsDataSource } from '../data-sources/coffee-shops.ds.service';
import { NearbyCoffeeShop } from './coffee-shops.types';

const NEARBY_COFFEE_SHOPS_LIMIT = 3;

interface FindNearbyCoffeeShopsInput {
  readonly x: number;
  readonly y: number;
}

@Injectable()
export class CoffeeShopsService {
  constructor(private readonly coffeeShopsDataSource: CoffeeShopsDataSource) {}

  async findNearby(
    input: FindNearbyCoffeeShopsInput,
  ): Promise<ReadonlyArray<NearbyCoffeeShop>> {
    const coffeeShops = await this.coffeeShopsDataSource.getCoffeeShops();
    const closestCoffeeShops: NearbyCoffeeShop[] = [];

    for (const coffeeShop of coffeeShops) {
      insertByDistance(closestCoffeeShops, {
        ...coffeeShop,
        distance: calculatePlanarDistance(
          input.x,
          input.y,
          coffeeShop.x,
          coffeeShop.y,
        ),
      });

      if (closestCoffeeShops.length > NEARBY_COFFEE_SHOPS_LIMIT) {
        closestCoffeeShops.pop();
      }
    }

    return closestCoffeeShops;
  }
}

export const calculatePlanarDistance = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): number => {
  const xDelta = targetX - sourceX;
  const yDelta = targetY - sourceY;

  return Math.hypot(xDelta, yDelta);
};

const insertByDistance = (
  coffeeShops: NearbyCoffeeShop[],
  coffeeShop: NearbyCoffeeShop,
): void => {
  const insertIndex = coffeeShops.findIndex(
    (existingCoffeeShop) => coffeeShop.distance < existingCoffeeShop.distance,
  );

  if (insertIndex === -1) {
    coffeeShops.push(coffeeShop);
    return;
  }

  coffeeShops.splice(insertIndex, 0, coffeeShop);
};
