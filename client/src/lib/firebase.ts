import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseConfig from "../../../firebase-applet-config.json";
import blueprint from "../../../firebase-blueprint.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== "undefined") {
  void testConnection();
}

const MAX_DISPLAY_NAME_LENGTH =
  blueprint.entities.UserProfile.properties.displayName.maxLength ?? 100;
const MAX_EMAIL_LENGTH =
  blueprint.entities.UserPrivateInfo.properties.email.maxLength ?? 254;
const VALID_ID_REGEX = new RegExp(
  blueprint.entities.UserProfile.properties.uid.pattern ?? "^[a-zA-Z0-9_\\-]+$"
);

function sanitizeDisplayName(raw: string | null | undefined, fallbackEmail: string | null | undefined): string {
  const base = (raw || fallbackEmail?.split("@")[0] || "Client MAZIGHO").trim();
  const clamped = base.slice(0, MAX_DISPLAY_NAME_LENGTH);
  return clamped.length > 0 ? clamped : "Client MAZIGHO";
}

export async function syncUserProfileToFirestore(user: FirebaseUser): Promise<void> {
  if (!user.uid || !VALID_ID_REGEX.test(user.uid)) return;

  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/default`;
  const userRef = doc(db, "users", user.uid);
  const privateRef = doc(db, "users", user.uid, "private", "default");

  const displayName = sanitizeDisplayName(user.displayName, user.email);
  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  try {
    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      existingSnap.exists() ? OperationType.UPDATE : OperationType.CREATE,
      userPath
    );
  }

  if (user.email) {
    const safeEmail = user.email.trim().slice(0, MAX_EMAIL_LENGTH);
    let privateSnap;
    try {
      privateSnap = await getDoc(privateRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, privatePath);
    }

    try {
      if (!privateSnap.exists()) {
        await setDoc(privateRef, {
          uid: user.uid,
          email: safeEmail,
          phone: (user.phoneNumber || "").slice(0, 40),
          address: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(privateRef, {
          email: safeEmail,
          phone: (user.phoneNumber || "").slice(0, 40),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        privateSnap.exists() ? OperationType.UPDATE : OperationType.CREATE,
        privatePath
      );
    }
  }

}

export async function signInWithGooglePopup(): Promise<{ idToken: string; user: FirebaseUser }> {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  await syncUserProfileToFirestore(credential.user);
  const idToken = await credential.user.getIdToken();
  return { idToken, user: credential.user };
}

export async function signInWithGoogleFirebase(): Promise<{
  uid: string;
  email: string | null;
  displayName: string;
  idToken: string;
}> {
  const { idToken, user } = await signInWithGooglePopup();
  return {
    uid: user.uid,
    email: user.email,
    displayName: sanitizeDisplayName(user.displayName, user.email),
    idToken,
  };
}

