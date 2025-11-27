import { Test, TestingModule } from '@nestjs/testing';
import { HdfcBusinessController } from './hdfc.controller';

describe('HdfcController', () => {
  let controller: HdfcBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HdfcBusinessController],
    }).compile();

    controller = module.get<HdfcBusinessController>(HdfcBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
