import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { HdfcService } from './hdfc.service';

@Injectable()
export class HdfcDecryptPipe implements PipeTransform {
  constructor(private readonly securityService: HdfcService) {}

  async transform(value: any) {
    // If body is NOT a JWE string (maybe already parsed), ignore
    if (typeof value !== 'string') return value;

    try {
      console.log('[Webhook Pipe] Intercepted encrypted request. Decrypting...');
      // In a webhook, the bank is the 'sender' (like a response)
      // So we use the same logic as decrypting a response
      const decrypted = await this.securityService.clientDecryptResponse(value);
      return decrypted;
    } catch (e) {
      throw new BadRequestException('Could not decrypt webhook payload');
    }
  }
}