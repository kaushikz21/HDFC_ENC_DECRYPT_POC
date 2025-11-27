import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HdfcService } from './hdfc.service';

@Injectable()
export class HdfcApiClient {
  constructor(
    private readonly httpService: HttpService,  
    private readonly securityService: HdfcService
  ) {}

  /**
   * The Main Method used by your entire app.
   * Input: Clean JSON
   * Output: Clean JSON
   * (Handles all encryption/decryption in the middle)
   */
  async post(endpoint: string, data: any) {
    console.log(`\n[Client] 1. Preparing to send to ${endpoint}...`);
    
    // 1. Encrypt
    const encryptedPayload = await this.securityService.clientEncryptRequest(data);
    console.log(`[Client] 2. Payload Encrypted: ${encryptedPayload.substring(0, 20)}...`);

    try {
      // 2. Transmit (Calling our Mock Bank Loopback)
      // In Production, replace URL with: `https://api.hdfcbank.com${endpoint}`
      const response = await firstValueFrom(
        this.httpService.post(`http://localhost:3000/mock-bank${endpoint}`, encryptedPayload, {
          headers: { 'Content-Type': 'application/jose' }
        })
      );

      console.log(`[Client] 3. Response Received from Bank.`);

      // 3. Decrypt
      // The bank returns a JWE string (response.data)
      const decryptedData = await this.securityService.clientDecryptResponse(response.data);
      console.log(`[Client] 4. Response Decrypted successfully.`);

      return decryptedData;

    } catch (error) {
      console.error('[Client] Error:', error.message);
      throw new HttpException('Bank Communication Failed', HttpStatus.BAD_GATEWAY);
    }
  }
}