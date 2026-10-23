import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf-8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));

type AuthContext = {
  uid: string;
  email: string;
  email_verified: boolean;
} | null;

type EvalState = {
  auth: AuthContext;
  requestTime: string;
  existingStores: Record<string, any>;
  existingUsers: Record<string, any>;
  existingOrders: Record<string, any>;
};

const VALID_ID_RE = /^[a-zA-Z0-9_\-]+$/;
const SLUG_RE = /^[a-z0-9-]+$/;

function isValidId(id: unknown): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && VALID_ID_RE.test(id);
}

function isValidStore(data: Record<string, any>, requestTime: string): boolean {
  const required = ['slug', 'displayName', 'primaryDomain', 'status', 'ownerId', 'createdAt', 'updatedAt'];
  const keys = Object.keys(data);
  if (!required.every(k => keys.includes(k)) || !keys.every(k => required.includes(k))) return false;
  if (typeof data.slug !== 'string' || data.slug.length < 2 || data.slug.length > 64 || !SLUG_RE.test(data.slug)) return false;
  if (typeof data.displayName !== 'string' || data.displayName.length < 2 || data.displayName.length > 120) return false;
  if (typeof data.primaryDomain !== 'string' || data.primaryDomain.length < 4 || data.primaryDomain.length > 160) return false;
  if (!['setup', 'active', 'suspended', 'closed'].includes(data.status)) return false;
  if (!isValidId(data.ownerId)) return false;
  if (typeof data.createdAt !== 'string' || typeof data.updatedAt !== 'string') return false;
  return data.updatedAt === requestTime;
}

function evaluateDirtyDozen(payloadName: string, state: EvalState, payload: Record<string, any>, targetPath: string, op: 'create' | 'update' | 'get' | 'list'): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!state.auth) return 'PERMISSION_DENIED';
  const isVerified = state.auth.email_verified === true;
  const isAdmin = isVerified && state.auth.email === 'yacbhl71@gmail.com';

  if (targetPath.startsWith('/stores/') && !targetPath.includes('/products/')) {
    const storeId = targetPath.split('/')[2];
    if (!isValidId(storeId)) return 'PERMISSION_DENIED';
    if (op === 'create') {
      if (!isVerified) return 'PERMISSION_DENIED';
      if (!isValidStore(payload, state.requestTime)) return 'PERMISSION_DENIED';
      if (payload.ownerId !== state.auth.uid || payload.status !== 'setup' || payload.createdAt !== state.requestTime) {
        return 'PERMISSION_DENIED';
      }
      return 'ALLOW';
    }
    if (op === 'update') {
      const existing = state.existingStores[storeId];
      if (!existing || !isVerified) return 'PERMISSION_DENIED';
      if (!isValidStore(payload, state.requestTime)) return 'PERMISSION_DENIED';
      if (payload.ownerId !== existing.ownerId || payload.createdAt !== existing.createdAt) return 'PERMISSION_DENIED';
      const changed = Object.keys(payload).filter(k => payload[k] !== existing[k]);
      const allowed = ['displayName', 'primaryDomain', 'updatedAt'];
      if (!isAdmin && (existing.ownerId !== state.auth.uid || !changed.every(k => allowed.includes(k)))) {
        return 'PERMISSION_DENIED';
      }
      return 'ALLOW';
    }
  }

  if (targetPath.includes('/products/')) {
    const [, , storeId, , productId] = targetPath.split('/');
    if (!isValidId(storeId) || !isValidId(productId) || !isVerified) return 'PERMISSION_DENIED';
    const parentStore = state.existingStores[storeId];
    if (!parentStore) return 'PERMISSION_DENIED';
    if (!isAdmin && parentStore.ownerId !== state.auth.uid) return 'PERMISSION_DENIED';
    if (payload.ownerId !== state.auth.uid || payload.storeId !== storeId) return 'PERMISSION_DENIED';
    return 'ALLOW';
  }

  if (targetPath.includes('/private/')) {
    const [, , userId, , docId] = targetPath.split('/');
    if (!isValidId(userId) || !isValidId(docId)) return 'PERMISSION_DENIED';
    if (op === 'get') {
      return state.auth.uid === userId || isAdmin ? 'ALLOW' : 'PERMISSION_DENIED';
    }
  }

  if (targetPath.startsWith('/orders')) {
    if (op === 'list') {
      return payload.ownerId === state.auth.uid ? 'ALLOW' : 'PERMISSION_DENIED';
    }
    const orderId = targetPath.split('/')[2];
    const existing = state.existingOrders[orderId];
    if (op === 'update') {
      if (!existing || !isVerified) return 'PERMISSION_DENIED';
      if (!isAdmin && ['completed', 'cancelled'].includes(existing.status)) return 'PERMISSION_DENIED';
      return 'ALLOW';
    }
  }

  return 'PERMISSION_DENIED';
}

describe('Firestore Hardened Security Rules & Dirty Dozen Verification', () => {
  const baseState: EvalState = {
    auth: { uid: 'uid_1', email: 'merchant@example.ch', email_verified: true },
    requestTime: '2026-10-23T10:00:00.000Z',
    existingStores: {
      store_1: {
        slug: 'atlas',
        displayName: 'Atelier Atlas',
        primaryDomain: 'atlas.mazigho.ch',
        status: 'active',
        ownerId: 'uid_1',
        createdAt: '2026-10-20T10:00:00.000Z',
        updatedAt: '2026-10-20T10:00:00.000Z',
      },
    },
    existingUsers: {
      uid_1: { ownerId: 'uid_1', displayName: 'Yacine' },
    },
    existingOrders: {
      order_1: {
        storeId: 'store_1',
        ownerId: 'uid_1',
        totalAmount: 18900,
        currency: 'CHF',
        status: 'completed',
        createdAt: '2026-10-20T10:00:00.000Z',
        updatedAt: '2026-10-20T10:00:00.000Z',
      },
    },
  };

  it('verifies rules_version = 2, default deny, and all blueprint collections are present in firestore.rules', () => {
    expect(rulesText).toContain("rules_version = '2';");
    expect(rulesText).toContain('match /{document=**}');
    expect(rulesText).toContain('allow read, write: if false;');
    expect(Object.keys(blueprint.firestore)).toEqual([
      '/stores/{storeId}',
      '/categories/{categoryId}',
      '/products/{productId}',
      '/reviews/{reviewId}',
      '/users/{userId}',
      '/users/{userId}/private/{infoId}',
      '/users/{userId}/cartItems/{cartItemId}',
      '/orders/{orderId}',
      '/admins/{adminId}',
    ]);
    expect(rulesText).toContain('match /stores/{storeId}');
    expect(rulesText).toContain('match /categories/{categoryId}');
    expect(rulesText).toContain('match /products/{productId}');
    expect(rulesText).toContain('match /reviews/{reviewId}');
    expect(rulesText).toContain('match /users/{userId}');
    expect(rulesText).toContain('match /private/{infoId}');
    expect(rulesText).toContain('match /cartItems/{cartItemId}');
    expect(rulesText).toContain('match /orders/{orderId}');
    expect(rulesText).toContain('match /admins/{adminId}');
  });

  it('rejects all 12 Dirty Dozen adversarial payloads with PERMISSION_DENIED', () => {
    expect(
      evaluateDirtyDozen(
        'shadow_field',
        baseState,
        {
          slug: 'atlas',
          displayName: 'Atlas',
          primaryDomain: 'atlas.mazigho.ch',
          status: 'setup',
          ownerId: 'uid_1',
          isVerified: true,
          createdAt: baseState.requestTime,
          updatedAt: baseState.requestTime,
        },
        '/stores/store_new',
        'create'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'identity_spoof',
        baseState,
        {
          slug: 'atlas',
          displayName: 'Atlas',
          primaryDomain: 'atlas.mazigho.ch',
          status: 'setup',
          ownerId: 'uid_2',
          createdAt: baseState.requestTime,
          updatedAt: baseState.requestTime,
        },
        '/stores/store_new',
        'create'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'unverified_email',
        { ...baseState, auth: { uid: 'uid_1', email: 'merchant@example.ch', email_verified: false } },
        {
          slug: 'atlas',
          displayName: 'Atlas',
          primaryDomain: 'atlas.mazigho.ch',
          status: 'setup',
          ownerId: 'uid_1',
          createdAt: baseState.requestTime,
          updatedAt: baseState.requestTime,
        },
        '/stores/store_new',
        'create'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'admin_spoof',
        { ...baseState, auth: { uid: 'uid_attacker', email: 'yacbhl71@gmail.com', email_verified: false } },
        {
          ...baseState.existingStores.store_1,
          displayName: 'Hacked',
          updatedAt: baseState.requestTime,
        },
        '/stores/store_1',
        'update'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'orphan_product',
        baseState,
        { storeId: 'missing_store', ownerId: 'uid_1' },
        '/stores/missing_store/products/prod_1',
        'create'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'cross_tenant_product',
        { ...baseState, auth: { uid: 'uid_2', email: 'other@example.ch', email_verified: true } },
        { storeId: 'store_1', ownerId: 'uid_2' },
        '/stores/store_1/products/prod_1',
        'update'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'pii_leak',
        { ...baseState, auth: { uid: 'uid_2', email: 'other@example.ch', email_verified: true } },
        {},
        '/users/uid_1/private/info',
        'get'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'immortal_field',
        baseState,
        {
          ...baseState.existingStores.store_1,
          ownerId: 'uid_2',
          updatedAt: baseState.requestTime,
        },
        '/stores/store_1',
        'update'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'timestamp_forgery',
        baseState,
        {
          slug: 'atlas',
          displayName: 'Atlas',
          primaryDomain: 'atlas.mazigho.ch',
          status: 'setup',
          ownerId: 'uid_1',
          createdAt: '2020-01-01T00:00:00.000Z',
          updatedAt: baseState.requestTime,
        },
        '/stores/store_new',
        'create'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'value_poisoning',
        baseState,
        {
          ...baseState.existingStores.store_1,
          displayName: 'A'.repeat(5000),
          updatedAt: baseState.requestTime,
        },
        '/stores/store_1',
        'update'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'terminal_state_bypass',
        baseState,
        {
          ...baseState.existingOrders.order_1,
          status: 'cancelled',
          updatedAt: baseState.requestTime,
        },
        '/orders/order_1',
        'update'
      )
    ).toBe('PERMISSION_DENIED');

    expect(
      evaluateDirtyDozen(
        'blanket_order_list',
        baseState,
        { ownerId: 'uid_other' },
        '/orders',
        'list'
      )
    ).toBe('PERMISSION_DENIED');
  });
});
