import type { CoffeeShopsDataSource } from '../data-sources/coffee-shops.ds.service';
import { CoffeeShopsService, calculatePlanarDistance } from './coffee-shops.service';

describe('CoffeeShopsService', () => {
  it('returns the three closest coffee shops using planar distance', async () => {
    const service = new CoffeeShopsService({
      getCoffeeShops: vi.fn().mockResolvedValue([
        { name: 'Starbucks Seattle', x: 47.5809, y: -122.316 },
        { name: 'Starbucks SF', x: 37.5209, y: -122.334 },
        { name: 'Starbucks Moscow', x: 55.752047, y: 37.595242 },
        { name: 'Starbucks Seattle2', x: 47.5869, y: -122.3368 },
        { name: 'Starbucks Rio De Janeiro', x: -22.923489, y: -43.234418 },
        { name: 'Starbucks Sydney', x: -33.871843, y: 151.206767 },
      ]),
    } as unknown as CoffeeShopsDataSource);

    const coffeeShops = await service.findNearby({ x: 47.6, y: -122.4 });

    expect(coffeeShops.map((coffeeShop) => coffeeShop.name)).toEqual([
      'Starbucks Seattle2',
      'Starbucks Seattle',
      'Starbucks SF',
    ]);
  });

  it('calculates Euclidean distance between two planar coordinates', () => {
    expect(calculatePlanarDistance(0, 0, 3, 4)).toBe(5);
  });
});
