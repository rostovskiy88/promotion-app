import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import { authService } from '../../services/auth';
import { createOrGetUser, getUserById } from '../../services/userService';
import { SerializedUser } from '../../types/auth';
import { FirestoreUser } from '../../types/user';
import { getAuthErrorMessage } from '../../utils/authErrors';

export interface AuthState {
  user: SerializedUser | null;
  firestoreUser: FirestoreUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  firestoreUser: null,
  loading: true,
  error: null,
  initialized: false,
};

// Helper function to serialize Firebase user
const serializeUser = (user: User): SerializedUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  phoneNumber: user.phoneNumber,
  isAnonymous: user.isAnonymous,
  providerData: user.providerData.map(provider => ({
    providerId: provider.providerId,
    uid: provider.uid,
    displayName: provider.displayName,
    email: provider.email,
    phoneNumber: provider.phoneNumber,
    photoURL: provider.photoURL,
  })),
});

// Helper function to serialize Firestore user data (convert Timestamps to strings)
const serializeFirestoreUser = (firestoreUser: any): FirestoreUser | null => {
  if (!firestoreUser) return null;

  return {
    ...firestoreUser,
    // Convert Firebase Timestamps to ISO strings
    createdAt: firestoreUser.createdAt?.toDate?.()?.toISOString() || firestoreUser.createdAt,
    updatedAt: firestoreUser.updatedAt?.toDate?.()?.toISOString() || firestoreUser.updatedAt,
    // Remove any other non-serializable properties if they exist
  };
};

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    const result = await authService.loginWithGoogle();
    await createOrGetUser({
      uid: result.user.uid,
      email: result.user.email!,
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || '',
    });
    return serializeUser(result.user);
  } catch (error: any) {
    return rejectWithValue(getAuthErrorMessage(error));
  }
});

export const loginWithFacebook = createAsyncThunk('auth/loginWithFacebook', async (_, { rejectWithValue }) => {
  try {
    const result = await authService.loginWithFacebook();
    await createOrGetUser({
      uid: result.user.uid,
      email: result.user.email!,
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || '',
    });
    return serializeUser(result.user);
  } catch (error: any) {
    return rejectWithValue(getAuthErrorMessage(error));
  }
});

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await authService.loginWithEmail(credentials);
      await createOrGetUser({
        uid: result.user.uid,
        email: result.user.email!,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      });
      return serializeUser(result.user);
    } catch (error: any) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    // Clear any persisted auth state
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
    return null;
  } catch (error: any) {
    return rejectWithValue(getAuthErrorMessage(error));
  }
});

// Add new async thunk to fetch/refresh Firestore user data
export const refreshFirestoreUser = createAsyncThunk(
  'auth/refreshFirestoreUser',
  async (uid: string, { rejectWithValue }) => {
    try {
      const userData = await getUserById(uid);
      return serializeFirestoreUser(userData);
    } catch (error: any) {
      return rejectWithValue('Failed to fetch user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.initialized = true;
    },
    setFirestoreUser: (state, action) => {
      state.firestoreUser = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    resetLoading: state => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Google login
      .addCase(loginWithGoogle.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Facebook login
      .addCase(loginWithFacebook.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Email login
      .addCase(loginWithEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.firestoreUser = null;
        state.initialized = true;
      })
      // Refresh Firestore user
      .addCase(refreshFirestoreUser.fulfilled, (state, action) => {
        state.firestoreUser = action.payload;
      });
  },
});

export const { setUser, setFirestoreUser, clearError, resetLoading } = authSlice.actions;
export default authSlice.reducer;
