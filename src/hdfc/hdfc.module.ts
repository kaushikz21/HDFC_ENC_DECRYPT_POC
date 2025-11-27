import { Module } from '@nestjs/common';
import { HdfcBusinessController } from './hdfc.controller';
import { HdfcService } from './hdfc.service';
import { MockBankController } from './mock-bank.controller';
import { HdfcApiClient } from './hdfc_api.client';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [HdfcBusinessController,MockBankController],
  providers: [HdfcService,HdfcApiClient]
})
export class HdfcModule {}
