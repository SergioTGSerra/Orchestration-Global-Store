import { Test, TestingModule } from '@nestjs/testing';
import { OrderProductsController } from './orderProducts.controller';

describe('OrderProductsController', () => {
  let controller: OrderProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderProductsController],
    }).compile();

    controller = module.get<OrderProductsController>(OrderProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
