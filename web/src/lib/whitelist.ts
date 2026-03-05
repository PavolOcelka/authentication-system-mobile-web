import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger';

/**
 * Check if an email address is in the whitelist
 *
 * @param email - Email address to check
 * @returns true if whitelisted and approved, false otherwise
 */
export const isEmailWhitelisted = async (email: string): Promise<boolean> => {
  try {
    // normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Get the document where ID = email
    const whitelistRef = doc(db, 'whitelist', normalizedEmail);
    const whitelistDoc = await getDoc(whitelistRef);

    // Document doesn't exist = not whitelisted
    if (!whitelistDoc.exists()) {
      logger.info('Whitelist check: email not found', { email: normalizedEmail });
      return false;
    }

    // Document exists but check the approved field
    const data = whitelistDoc.data();
    const approved = data?.approved === true;
    logger.info('Whitelist check result', { email: normalizedEmail, approved });
    return approved;

  } catch (error) {
    logger.error('Whitelist check failed:', error);
    return false;
  }
};