import { Test, TestingModule } from '@nestjs/testing';
import { ShipModesController } from './shipModes.controller';

describe('ShipModesController', () => {
  let controller: ShipModesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipModesController],
    }).compile();

    controller = module.get<ShipModesController>(ShipModesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
