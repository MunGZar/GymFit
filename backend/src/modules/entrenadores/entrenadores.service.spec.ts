import { Test, TestingModule } from '@nestjs/testing';
import { EntrenadoresService } from './entrenadores.service';

describe('EntrenadoresService', () => {
  let service: EntrenadoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntrenadoresService],
    }).compile();

    service = module.get<EntrenadoresService>(EntrenadoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
