export const STATIC_OTP = process.env.STATIC_OTP || "123456";

export async function sendPhoneOtp(phone: string) {
  void phone;
  return { ok: true, staticOtp: STATIC_OTP };
}

export async function verifyPhoneOtp(phone: string, code: string) {
  void phone;
  return code === STATIC_OTP;
}
