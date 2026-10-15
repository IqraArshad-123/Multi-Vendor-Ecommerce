const crypto = require('crypto');
const ErrorHandler = require('./ErrorHandler');
const key = () => {
  if (!process.env.ACTIVATION_SECRET) throw new Error('Account activation is not configured');
  return crypto.createHash('sha256').update(process.env.ACTIVATION_SECRET).digest();
};
exports.create = (data, kind) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  cipher.setAAD(Buffer.from(kind));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({data,expires:Date.now()+86400000})),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');
};
exports.read = (token, kind) => {
  try {
    const bytes = Buffer.from(token, 'base64url');
    const decipher = crypto.createDecipheriv('aes-256-gcm',key(),bytes.subarray(0,12));
    decipher.setAAD(Buffer.from(kind));decipher.setAuthTag(bytes.subarray(12,28));
    const payload = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString());
    if(payload.expires < Date.now()) throw new Error('Expired');
    return payload.data;
  } catch { throw new ErrorHandler('Activation link is invalid or expired. Please sign up again.',400); }
};
