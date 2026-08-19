import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type Author, type Work, type Character } from '../data';
import { resolveType, resolveFullStack, deriveAxesFromQuadra, normalizeDynamic, slugify } from '../lib/ct-logic';

export interface InviteCode {
  id: string;
  code: string;
  authorName: string;
  role: 'admin' | 'author';
  isUsed: boolean;
  usedAt?: string | null;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// 1. Single-Use Invite Code & Author Token Management
// ----------------------------------------------------------------------------

export function generateRandomCode(prefix = 'CT'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let segment1 = '';
  let segment2 = '';
  for (let i = 0; i < 4; i++) {
    segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${segment1}-${segment2}`;
}

export async function createInviteCode(
  authorName: string,
  role: 'admin' | 'author' = 'author',
  notes = '',
  createdBy = 'Admin'
): Promise<InviteCode> {
  const code = generateRandomCode(role === 'admin' ? 'CT-ADM' : 'CT-AUTH');
  const codeId = slugify(code);
  const now = new Date().toISOString();

  const newCode: InviteCode = {
    id: codeId,
    code,
    authorName: authorName.trim(),
    role,
    isUsed: false,
    usedAt: null,
    createdAt: now,
    createdBy,
    notes
  };

  await setDoc(doc(db, 'invite_codes', codeId), newCode);
  return newCode;
}

export async function redeemInviteCode(inputCode: string): Promise<{ success: boolean; authorName?: string; role?: 'admin' | 'author'; message: string }> {
  const cleanCode = inputCode.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Please enter a valid passcode' };
  }

  // Check for built-in Master Admin keys (case-insensitive)
  if (
    cleanCode === 'OSAKPOLOR' ||
    cleanCode === 'OSAKPOLOR-ADMIN' ||
    cleanCode === 'OSAKPOLOR-2026' ||
    cleanCode === 'OSAS-ADMIN-2026' ||
    cleanCode === 'CT-MASTER-ADMIN'
  ) {
    // Ensure Osakpolor author profile is saved
    try {
      await saveAuthor({
        id: 'osakpolor',
        name: 'Osakpolor',
        validatedBy: 'System Administrator'
      });
    } catch (e) {
      console.error('Error auto-saving Osakpolor author profile:', e);
    }

    return {
      success: true,
      authorName: 'Osakpolor',
      role: 'admin',
      message: 'Welcome back, Osakpolor!'
    };
  }

  try {
    const q = query(collection(db, 'invite_codes'), where('code', '==', cleanCode));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Also try normalized ID
      const byId = await getDoc(doc(db, 'invite_codes', slugify(cleanCode)));
      if (!byId.exists()) {
        return { success: false, message: 'Invalid single-use code. Please verify the code or contact the administrator.' };
      }
      const codeData = byId.data() as InviteCode;
      if (codeData.isUsed) {
        return { success: false, message: `This code was already used on ${codeData.usedAt ? new Date(codeData.usedAt).toLocaleDateString() : 'a previous session'}.` };
      }

      // Mark as used
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'invite_codes', byId.id), {
        isUsed: true,
        usedAt: now
      });

      // Ensure author entry exists
      if (codeData.authorName) {
        await saveAuthor({
          id: slugify(codeData.authorName),
          name: codeData.authorName,
          validatedBy: 'Invite Code'
        });
      }

      return {
        success: true,
        authorName: codeData.authorName,
        role: codeData.role,
        message: `Welcome, ${codeData.authorName}! Your author session has been activated.`
      };
    }

    const docItem = snap.docs[0];
    const codeData = docItem.data() as InviteCode;

    if (codeData.isUsed) {
      return {
        success: false,
        message: `This single-use code was already redeemed on ${codeData.usedAt ? new Date(codeData.usedAt).toLocaleDateString() : 'a previous date'}.`
      };
    }

    // Mark as used
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'invite_codes', docItem.id), {
      isUsed: true,
      usedAt: now
    });

    // Ensure author exists in database
    if (codeData.authorName) {
      await saveAuthor({
        id: slugify(codeData.authorName),
        name: codeData.authorName,
        validatedBy: 'Invite Code'
      });
    }

    return {
      success: true,
      authorName: codeData.authorName,
      role: codeData.role,
      message: `Welcome, ${codeData.authorName}! Access granted.`
    };
  } catch (err: any) {
    console.error('Code redemption error:', err);
    return { success: false, message: err.message || 'Verification error' };
  }
}

export async function getInviteCodes(): Promise<InviteCode[]> {
  try {
    const snap = await getDocs(collection(db, 'invite_codes'));
    const list: InviteCode[] = [];
    snap.forEach((d) => {
      list.push(d.data() as InviteCode);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching invite codes:', e);
    return [];
  }
}

export async function deleteInviteCode(codeId: string): Promise<void> {
  await deleteDoc(doc(db, 'invite_codes', codeId));
}

// ----------------------------------------------------------------------------
// 2. Authors Collection
// ----------------------------------------------------------------------------

export async function getAuthors(): Promise<Author[]> {
  try {
    const snap = await getDocs(collection(db, 'authors'));
    const list: Author[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Author);
    });
    return list;
  } catch (e) {
    console.error('Error fetching authors:', e);
    return [];
  }
}

function cleanFirestorePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

export async function saveAuthor(author: Partial<Author> & { id: string; name: string }): Promise<void> {
  const authorDocRef = doc(db, 'authors', author.id);
  const now = new Date().toISOString();
  const payload = cleanFirestorePayload({
    ...author,
    updatedAt: now,
    createdAt: (author as any).createdAt || now
  });
  await setDoc(authorDocRef, payload, { merge: true });
}

export async function deleteAuthor(authorId: string): Promise<void> {
  await deleteDoc(doc(db, 'authors', authorId));
}

// ----------------------------------------------------------------------------
// 3. Works Collection
// ----------------------------------------------------------------------------

export async function getWorks(): Promise<Work[]> {
  try {
    const snap = await getDocs(collection(db, 'works'));
    const list: Work[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Work);
    });
    return list;
  } catch (e) {
    console.error('Error fetching works:', e);
    return [];
  }
}

export async function saveWork(work: Partial<Work> & { id: string; title: string; medium: string }): Promise<void> {
  const workDocRef = doc(db, 'works', work.id);
  const now = new Date().toISOString();
  const payload = cleanFirestorePayload({
    ...work,
    updatedAt: now,
    createdAt: (work as any).createdAt || now
  });
  await setDoc(workDocRef, payload, { merge: true });
}

export async function deleteWork(workId: string): Promise<void> {
  await deleteDoc(doc(db, 'works', workId));
}

// ----------------------------------------------------------------------------
// 4. Characters Collection (Cognitive Typology Profiles)
// ----------------------------------------------------------------------------

export async function getCharactersFromFirestore(): Promise<Character[]> {
  try {
    const snap = await getDocs(collection(db, 'characters'));
    const list: Character[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Character);
    });
    return list;
  } catch (e) {
    console.error('Error fetching characters from Firestore:', e);
    return [];
  }
}

export async function saveCharacterToFirestore(character: Partial<Character> & { id: string; name: string; type: string }): Promise<void> {
  const charDocRef = doc(db, 'characters', character.id);
  const now = new Date().toISOString();

  // Compute derivations automatically if fully resolved
  let quadra = character.quadra || character.rawQuadra || '';
  let judgmentAxis = character.judgmentAxis || '';
  let perceptionAxis = character.perceptionAxis || '';
  let leadFunction = character.leadFunction || '';
  let auxiliaryFunction = character.auxiliaryFunction || '';
  let tertiaryFunction = character.tertiaryFunction || '';
  let polarFunction = character.polarFunction || '';
  let leadEnergetic = character.leadEnergetic || '';
  let auxiliaryEnergetic = character.auxiliaryEnergetic || '';
  let tertiaryEnergetic = character.tertiaryEnergetic || '';
  let polarEnergetic = character.polarEnergetic || '';

  if (character.type && character.type.length === 4) {
    const stack = resolveFullStack(character.type);
    if (stack) {
      quadra = stack.quadra;
      judgmentAxis = stack.judgmentAxis;
      perceptionAxis = stack.perceptionAxis;
      leadFunction = stack.lead;
      auxiliaryFunction = stack.auxiliary;
      tertiaryFunction = stack.tertiary;
      polarFunction = stack.polar;
      leadEnergetic = stack.leadEnergetic;
      auxiliaryEnergetic = stack.auxiliaryEnergetic;
      tertiaryEnergetic = stack.tertiaryEnergetic;
      polarEnergetic = stack.polarEnergetic;
    }
  } else if (character.rawQuadra) {
    const axes = deriveAxesFromQuadra(character.rawQuadra);
    judgmentAxis = axes.judgment;
    perceptionAxis = axes.perception;
  }

  const payload = cleanFirestorePayload({
    ...character,
    quadra,
    rawQuadra: character.rawQuadra || undefined,
    judgmentAxis,
    perceptionAxis,
    leadFunction,
    auxiliaryFunction,
    tertiaryFunction,
    polarFunction,
    leadEnergetic,
    auxiliaryEnergetic,
    tertiaryEnergetic,
    polarEnergetic,
    dynamic: character.dynamic ? normalizeDynamic(character.dynamic) : undefined,
    subtype: character.dynamic ? normalizeDynamic(character.dynamic) : character.subtype,
    updatedAt: now,
    createdAt: (character as any).createdAt || now,
    publishedDate: character.publishedDate || now
  });

  await setDoc(charDocRef, payload, { merge: true });
}

export async function deleteCharacterFromFirestore(characterId: string): Promise<void> {
  await deleteDoc(doc(db, 'characters', characterId));
}
