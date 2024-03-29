import { Test, TestingModule } from '@nestjs/testing';
import { PrioritiesController } from './priorities.controller';

describe('PrioritiesController', () => {
  let controller: PrioritiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrioritiesController],
    }).compile();

    controller = module.get<PrioritiesController>(PrioritiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
