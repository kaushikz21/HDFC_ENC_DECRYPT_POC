const { generateKeyPair, exportPKCS8, exportSPKI } = require('jose');
const fs = require('fs');
const path = require('path');

async function generateKeys() {
  const dir = path.join(__dirname, 'keys');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  console.log('Generating Partner (Your) Keys...');
  // FIX: Added 'extractable: true' so we can save the key to a file
  const partner = await generateKeyPair('RS256', { 
    modulusLength: 2048,
    extractable: true 
  });
  
  const partnerPrivatePem = await exportPKCS8(partner.privateKey);
  fs.writeFileSync(path.join(dir, 'partner_private.pem'), partnerPrivatePem);

  const partnerPublicPem = await exportSPKI(partner.publicKey);
  fs.writeFileSync(path.join(dir, 'partner_public.pem'), partnerPublicPem);

  console.log('Generating Bank (HDFC Mock) Keys...');
  // FIX: Added 'extractable: true' here as well
  const bank = await generateKeyPair('RS256', { 
    modulusLength: 2048,
    extractable: true 
  });
  
  const bankPrivatePem = await exportPKCS8(bank.privateKey);
  fs.writeFileSync(path.join(dir, 'bank_private.pem'), bankPrivatePem);

  const bankPublicPem = await exportSPKI(bank.publicKey);
  fs.writeFileSync(path.join(dir, 'bank_public.pem'), bankPublicPem);

  console.log('✅ Keys generated in /keys folder');
}

generateKeys();