import { Test, TestingModule } from '@nestjs/testing';
import { ShipModesService } from './shipModes.service';

describe('ShipModesService', () => {
  let service: ShipModesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipModesService],
    }).compile();

    service = module.get<ShipModesService>(ShipModesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

