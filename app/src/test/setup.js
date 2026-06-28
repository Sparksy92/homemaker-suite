import { vi } from 'vitest';
import '@testing-library/jest-dom';

// 0. matchMedia Mock
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});

// 1. LocalStorage Mock
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn(key => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn(index => Object.keys(store)[index] || null)
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// 2. Fetch API Mock
window.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob())
    })
);

// 3. Supabase Client Mock (Thenable chain mock)
export const mockQuery = {
    select: vi.fn(() => mockQuery),
    upsert: vi.fn(() => mockQuery),
    update: vi.fn(() => mockQuery),
    delete: vi.fn(() => mockQuery),
    eq: vi.fn(() => mockQuery),
    then: vi.fn((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    })
};

const mockUser = { id: 'test-user-uuid-1234', email: 'test@example.com' };
const mockAuth = {
    getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signInAnonymously: vi.fn(() => Promise.resolve({ data: { user: { id: 'anonymous-user-uuid' } }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    updateUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null }))
};

export const mockClient = {
    auth: mockAuth,
    from: vi.fn(() => mockQuery)
};

// Mock the client utils
vi.mock('@/utils/supabaseClient', () => ({
    supabase: mockClient,
    isSupabaseConfigured: true
}));

vi.mock('../utils/supabaseClient', () => ({
    supabase: mockClient,
    isSupabaseConfigured: true
}));

vi.mock('../../utils/supabaseClient', () => ({
    supabase: mockClient,
    isSupabaseConfigured: true
}));

// 4. IndexedDB Mock
const mockIDBRequest = {
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
};

const mockTransaction = {
    objectStore: vi.fn(() => ({
        clear: vi.fn()
    })),
    set oncomplete(callback) {
        if (callback) {
            setTimeout(callback, 0);
        }
    }
};

const mockIDBDatabase = {
    objectStoreNames: {
        contains: vi.fn(() => true)
    },
    transaction: vi.fn(() => mockTransaction),
    close: vi.fn()
};

window.indexedDB = {
    open: vi.fn(() => {
        setTimeout(() => {
            if (mockIDBRequest.onupgradeneeded) {
                mockIDBRequest.onupgradeneeded({ target: { result: mockIDBDatabase } });
            }
            if (mockIDBRequest.onsuccess) {
                const event = { target: { result: mockIDBDatabase } };
                mockIDBRequest.onsuccess(event);
            }
        }, 0);
        return mockIDBRequest;
    })
};
