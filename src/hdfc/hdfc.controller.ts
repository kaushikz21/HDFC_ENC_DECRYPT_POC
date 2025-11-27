// import { Controller, Post, Body } from '@nestjs/common';
// import { HdfcService } from './hdfc.service';

// @Controller('hdfc-poc')
// export class HdfcController {
//   constructor(private readonly hdfcService: HdfcService) {}

//   @Post('test-flow')
//   async testEncryption(@Body() body: any) {
//     console.log('--- Starting HDFC Encryption POC ---');
    
//     // 1. Encrypt the incoming body
//     const encryptedToken = await this.hdfcService.encryptRequest(body);
//     console.log('Final Encrypted Token (JWE):', encryptedToken);

//     // 2. Decrypt it back (Proof that it works)
//     const decryptedData = await this.hdfcService.decryptResponse(encryptedToken);
    
//     return {
//       status: 'Success',
//       original: body,
//       encrypted_jwe: encryptedToken,
//       decrypted_verification: decryptedData
//     };
//   }

//   // inside src/hdfc/hdfc.controller.ts

//   @Post('test-failure')
//   async testFailure(@Body() body: any) {
//     const results = {};

//     // TEST 1: EXPIRED TOKEN
//     try {
//       console.log('--- Testing Expired Token ---');
//       const expiredJwe = await this.hdfcService.generateExpiredToken(body);
//       // This MUST throw an error
//       await this.hdfcService.decryptResponse(expiredJwe);
//       results['expired_test'] = 'FAILED: System accepted an expired token!';
//     } catch (e) {
//       console.log('Expected Error:', e.code || e.message);
//       results['expired_test'] = `SUCCESS: Caught expected error -> ${e.code || e.message}`;
//     }

//     // TEST 2: TAMPERED TOKEN
//     try {
//       console.log('--- Testing Tampered Token ---');
//       const tamperedJwe = await this.hdfcService.generateTamperedToken(body);
//       // This MUST throw an error
//       await this.hdfcService.decryptResponse(tamperedJwe);
//       results['tamper_test'] = 'FAILED: System accepted a fake signature!';
//     } catch (e) {
//       console.log('Expected Error:', e.code || e.message);
//       results['tamper_test'] = `SUCCESS: Caught expected error -> ${e.code || e.message}`;
//     }

//     return results;
//   }
// }



import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { HdfcApiClient } from './hdfc_api.client';
import { HdfcDecryptPipe } from './hdfc_dcrypt.pipe';

@Controller('payment')
export class HdfcBusinessController {
  constructor(private readonly hdfcClient: HdfcApiClient) {}

  // SCENARIO 1: Outgoing (You initiate transfer)
  @Post('initiate')
  async initiatePayment(@Body() body: any) {
    // Look how clean this is! No encryption code.
    console.log('--- Starting Business Transaction ---');
    
    // We just call the client
    const result = await this.hdfcClient.post('/fund-transfer', body);
    
    return {
      app_status: 'Payment Completed',
      bank_data: result
    };
  }

  // SCENARIO 2: Incoming Webhook (Bank calls you)
  // curl -X POST http://localhost:3000/payment/webhook -d "ey..." -H "Content-Type: text/plain"
  @Post('webhook')
  @UsePipes(HdfcDecryptPipe) // <--- Magic happens here
  async handleWebhook(@Body() cleanData: any) {
    console.log('--- Webhook Received ---');
    console.log('Clean Data inside Controller:', cleanData);
    
    return { status: 'Webhook Processed' };
  }
}