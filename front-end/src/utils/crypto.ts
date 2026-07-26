/**
 * HMAC Anti-Tamper Signing Utility using Web Crypto SHA-256
 */
const SECRET_KEY = 'OmniPOS_Enterprise_AntiTamper_Key_2026';

export async function computeHmacSignature(
  orderId: string,
  orderNo: string,
  grandTotal: number,
  createdAt: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataToSign = `${orderId}:${orderNo}:${grandTotal.toFixed(2)}:${createdAt}`;

    const keyData = encoder.encode(SECRET_KEY);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(dataToSign)
    );

    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hmacHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hmacHex;
  } catch (err) {
    console.error('Error computing HMAC signature:', err);
    // Fallback pseudo-signature if Web Crypto is unavailable in non-secure context
    return `HMAC-${orderId}-${Math.floor(grandTotal * 100)}`;
  }
}

export async function verifyHmacSignature(
  orderId: string,
  orderNo: string,
  grandTotal: number,
  createdAt: string,
  existingSignature: string
): Promise<boolean> {
  const computed = await computeHmacSignature(orderId, orderNo, grandTotal, createdAt);
  return computed === existingSignature;
}
