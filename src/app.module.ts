import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HdfcModule } from './hdfc/hdfc.module';

@Module({
  imports: [HdfcModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
