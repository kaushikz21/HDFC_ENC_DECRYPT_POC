import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { HdfcService } from './hdfc.service';

@Controller('mock-bank')
export class MockBankController {
  constructor(private readonly hdfcService: HdfcService) {}

  @Post('fund-transfer')
  async handleFundTransfer(@Body() encryptedBody: any) {
    console.log(`\n[HDFC BANK SERVER] Received Request.`);
    
    // 1. INPUT SANITIZATION
    // With the main.ts fix, 'encryptedBody' should be a raw string.
    let jweString = encryptedBody;

    // Safety Fallback: If for some reason it arrives as an object (e.g. wrong content-type),
    // we try to extract the key.
    if (typeof encryptedBody === 'object' && encryptedBody !== null) {
        const keys = Object.keys(encryptedBody);
        if (keys.length > 0) {
            jweString = keys[0];
        }
    }

    // Validate that we actually have a JWE token (starts with 'ey')
    if (typeof jweString !== 'string' || !jweString.startsWith('ey')) {
        console.error('[HDFC BANK SERVER] Error: Body is empty or not a valid JWE string');
        throw new BadRequestException('Invalid JWE Body received. Ensure Content-Type is application/jose');
    }

    // 2. DECRYPT (Bank decrypts your request)
    // We use the string we just validated
    const clientRequest = await this.hdfcService.bankDecryptRequest(jweString);
    console.log(`[HDFC BANK SERVER] Decrypted Client Data:`, clientRequest);

    // 3. PROCESS (Simulate Bank Logic)
    const bankResponse = {
        status: "SUCCESS",
        txn_id: "HDFC" + Math.floor(Math.random() * 1000000),
        message: "Fund Transfer Processed Successfully",
        original_amount: clientRequest.amount
    };

    // 4. ENCRYPT (Bank encrypts response back to you)
    const encryptedResponse = await this.hdfcService.bankEncryptResponse(bankResponse);
    
    // Return the raw JWE string
    return encryptedResponse; 
  }
}