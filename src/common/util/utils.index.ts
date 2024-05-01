import { randomBytes } from 'crypto';

export const nairaToKobo = (naira: number): number => {
  return naira * 100;
};

export const koboToNaira = (kobo: number): number => {
  return kobo / 100;
};

// My preferred random generator is UUID but for the sake of this test, I will use crypto
export const generateTransactionHash = () => randomBytes(12).toString('hex'); // return 24 chars
