/**
 * Firebase Cloud Functions
 *
 * Blocking functions run server-side before Auth operations complete.
 * They cannot be bypassed by the client.
 */

import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

const WHITELIST_COLLECTION = 'whitelist';

/**
 * Block user creation unless the email is in the whitelist.
 *
 * This runs BEFORE the Auth account is created — the only way to prevent
 * unauthorized accounts at the Auth layer. Firestore rules alone cannot
 * block createUserWithEmailAndPassword(); this function can.
 *
 * Requires: Firebase project upgraded to Identity Platform.
 *
 * Whitelist structure (Firestore):
 *   Collection: whitelist
 *   Document ID: normalized email (lowercase, trimmed)
 *   Field: approved: boolean (must be true)
 */
export const beforeUserCreatedBlockWhitelist = beforeUserCreated(async (event) => {
  const user = event.data;

  if (!user?.email) {
    throw new HttpsError('invalid-argument', 'Email is required for registration.');
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const whitelistRef = db.collection(WHITELIST_COLLECTION).doc(normalizedEmail);
  const whitelistDoc = await whitelistRef.get();

  if (!whitelistDoc.exists) {
    throw new HttpsError(
      'permission-denied',
      'This email is not authorized. Registration is available by invitation only.'
    );
  }

  const data = whitelistDoc.data();
  if (data?.approved !== true) {
    throw new HttpsError(
      'permission-denied',
      'This email is not authorized. Registration is available by invitation only.'
    );
  }
});
