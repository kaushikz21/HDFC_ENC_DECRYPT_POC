import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { importPKCS8, importSPKI, SignJWT, CompactEncrypt, compactDecrypt, jwtVerify } from 'jose';

@Injectable()
export class HdfcService implements OnModuleInit {
  
  // --- CLIENT KEYS (You) ---
  private partnerSignKey: CryptoKey;      // Private: To Sign Requests (RS256)
  private partnerDecryptKey: CryptoKey;   // Private: To Decrypt Responses (RSA-OAEP-256)
  
  private bankEncryptKey: CryptoKey;      // Public: To Encrypt Requests (RSA-OAEP-256)
  private bankVerifyKey: CryptoKey;       // Public: To Verify Responses (RS256)

  // --- BANK KEYS (Simulation) ---
  private bankSignKey: CryptoKey;         // Private: To Sign Responses (RS256)
  private bankDecryptKey: CryptoKey;      // Private: To Decrypt Requests (RSA-OAEP-256)
  
  private partnerVerifyKey: CryptoKey;    // Public: To Verify Client Requests (RS256)
  private partnerEncryptKey: CryptoKey;   // Public: To Encrypt Bank Responses (RSA-OAEP-256)

  async onModuleInit() {
    const keyDir = path.join(process.cwd(), 'keys');
    
    // READ RAW FILES
    const partnerPriv = fs.readFileSync(path.join(keyDir, 'partner_private.pem'), 'utf8');
    const partnerPub = fs.readFileSync(path.join(keyDir, 'partner_public.pem'), 'utf8');
    const bankPriv = fs.readFileSync(path.join(keyDir, 'bank_private.pem'), 'utf8');
    const bankPub = fs.readFileSync(path.join(keyDir, 'bank_public.pem'), 'utf8');

    // 1. SETUP CLIENT KEYS (For HdfcApiClient)
    this.partnerSignKey = await importPKCS8(partnerPriv, 'RS256');       // For Signing
    this.partnerDecryptKey = await importPKCS8(partnerPriv, 'RSA-OAEP-256'); // For Decrypting
    
    this.bankEncryptKey = await importSPKI(bankPub, 'RSA-OAEP-256');     // For Encrypting to Bank
    this.bankVerifyKey = await importSPKI(bankPub, 'RS256');             // For Verifying Bank

    // 2. SETUP BANK KEYS (For MockBankController)
    this.bankDecryptKey = await importPKCS8(bankPriv, 'RSA-OAEP-256');   // For Decrypting Client
    this.bankSignKey = await importPKCS8(bankPriv, 'RS256');             // For Signing Response
    
    this.partnerVerifyKey = await importSPKI(partnerPub, 'RS256');       // For Verifying Client
    this.partnerEncryptKey = await importSPKI(partnerPub, 'RSA-OAEP-256'); // For Encrypting to Client
  }

  // ==========================================================
  // CLIENT SIDE METHODS
  // ==========================================================

  /** Encrypts a Request to send TO the Bank */
  async clientEncryptRequest(payload: any): Promise<string> {
    // 1. Sign with YOUR Private Key (RS256)
    const jws = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256' }) 
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(this.partnerSignKey);

    // 2. Encrypt with BANK Public Key (RSA-OAEP-256)
    return await new CompactEncrypt(new TextEncoder().encode(jws))
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .encrypt(this.bankEncryptKey);
  }

  /** Decrypts a Response received FROM the Bank */
  async clientDecryptResponse(jweToken: string): Promise<any> {
    // 1. Decrypt with YOUR Private Key (RSA-OAEP-256)
    const { plaintext } = await compactDecrypt(jweToken, this.partnerDecryptKey);
    const jwsString = new TextDecoder().decode(plaintext);
    
    // 2. Verify with BANK Public Key (RS256)
    const { payload } = await jwtVerify(jwsString, this.bankVerifyKey);
    return payload;
  }

  // ==========================================================
  // BANK SIDE METHODS (Simulation)
  // ==========================================================

  /** Bank Decrypts Your Request */
  async bankDecryptRequest(jweToken: string): Promise<any> {
    // 1. Decrypt with BANK Private Key (RSA-OAEP-256)
    const { plaintext } = await compactDecrypt(jweToken, this.bankDecryptKey);
    const jwsString = new TextDecoder().decode(plaintext);

    // 2. Verify with PARTNER Public Key (RS256)
    const { payload } = await jwtVerify(jwsString, this.partnerVerifyKey);
    return payload;
  }

  /** Bank Encrypts a Response */
  async bankEncryptResponse(payload: any): Promise<string> {
    // 1. Sign with BANK Private Key (RS256)
    const jws = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(this.bankSignKey);

    // 2. Encrypt with PARTNER Public Key (RSA-OAEP-256)
    return await new CompactEncrypt(new TextEncoder().encode(jws))
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .encrypt(this.partnerEncryptKey);
  }
}