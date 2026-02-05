import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { data: null, error: error.message || 'Failed to sign in with Google' };
  }
}

/**
 * Sign up a new user
 */
export async function signUp({ email, password, name }: SignUpData) {
  try {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Wait for the database trigger to create the profile automatically
    // The trigger should handle profile creation, but we'll wait and verify
    let profile = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (data && !error) {
        profile = data;
        break;
      }
      attempts++;
    }

    // If trigger didn't create the profile, try to create it manually
    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          xp: 0,
          level: 1,
          streak: 0,
        })
        .select()
        .single();

      if (profileError) {
        // Check one more time if profile exists
        const { data: finalCheck } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!finalCheck) {
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
        profile = finalCheck;
      } else {
        profile = newProfile;
      }
    }

    // Update local store with profile data
    if (profile) {
      useUserStore.getState().login(profile.email, profile.name);
      useUserStore.setState({
        user: {
          name: profile.name,
          email: profile.email,
          xp: profile.xp || 0,
          level: profile.level || 1,
          streak: profile.streak || 0,
        },
      });
    }

    return { user: authData.user, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { user: null, error: error.message || 'Failed to sign up' };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Update local store
    useUserStore.getState().login(profile.email, profile.name);
    useUserStore.setState({
      user: {
        name: profile.name,
        email: profile.email,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
      },
    });

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { user: null, error: error.message || 'Failed to sign in' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Update local store
    useUserStore.getState().logout();

    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    return { session: null, error: error.message };
  }
}

/**
 * Initialize auth state on app load
 */
export async function initializeAuth() {
  try {
    const { session, error } = await getSession();
    if (error || !session) {
      useUserStore.getState().logout();
      return;
    }

    // Fetch user profile
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // If profile doesn't exist (OAuth first-time user), create it
    if (profileError || !profile) {
      const userName = session.user.user_metadata?.name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'User';

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          name: userName,
          xp: 0,
          level: 1,
          streak: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user profile:', createError);
        useUserStore.getState().logout();
        return;
      }

      profile = newProfile;
    }

    // Update local store
    useUserStore.getState().login(profile.email, profile.name);
    useUserStore.setState({
      isAuthenticated: true,
      user: {
        name: profile.name,
        email: profile.email,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
      },
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    useUserStore.getState().logout();
  }
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return { error: error.message || 'Failed to send password reset email' };
  }
}

/**
 * Reset password using the token from email link
 */
export async function resetPassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { error: error.message || 'Failed to reset password' };
  }
}

/**
 * Update email address for the current user
 */
export async function updateEmail(newEmail: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Email update error:', error);
    return { error: error.message || 'Failed to update email' };
  }
}

/**
 * Update password for logged-in user
 */
export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    // First verify current password by attempting to sign in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No user logged in');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) throw new Error('Current password is incorrect');

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Password update error:', error);
    return { error: error.message || 'Failed to update password' };
  }
}

/**
 * Bypass login for hackathon judges
 * This signs in with a demo account to create a real Supabase session
 */
export async function judgeBypassLogin() {
  try {
    console.log('🎯 Judge bypass login initiated...');

    // Use demo credentials for judge access
    const JUDGE_EMAIL = 'hackathon.judge.demo@gmail.com';
    const JUDGE_PASSWORD = 'Judge@Hackathon2024';

    console.log('📝 Attempting to sign in with judge credentials...');

    // Try to sign in with existing judge account
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: JUDGE_EMAIL,
      password: JUDGE_PASSWORD,
    });

    // If sign in fails (account doesn't exist), create the account
    if (signInError) {
      console.log('⚠️ Judge account not found, creating new account...');

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: JUDGE_EMAIL,
        password: JUDGE_PASSWORD,
        options: {
          data: {
            name: 'Hackathon Judge',
          },
        },
      });

      if (signUpError) {
        console.error('❌ Failed to create judge account:', signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Failed to create judge account');
      }

      console.log('✅ Judge account created, signing in...');

      // Now sign in with the newly created account
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: JUDGE_EMAIL,
        password: JUDGE_PASSWORD,
      });

      if (newSignInError) throw newSignInError;

      // Create profile for the new user
      await createJudgeProfile(signUpData.user.id);
    } else {
      console.log('✅ Judge signed in successfully');
    }

    // Fetch and update user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user after sign in');

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      useUserStore.getState().login(profile.email, profile.name);
      useUserStore.setState({
        isAuthenticated: true,
        user: {
          name: profile.name,
          email: profile.email,
          xp: profile.xp,
          level: profile.level,
          streak: profile.streak,
        },
      });
    }

    console.log('✅ Judge bypass login successful!');
    console.log('Current auth state:', useUserStore.getState().isAuthenticated);

    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ Judge bypass login error:', error);
    return { success: false, error: error.message || 'Failed to bypass login' };
  }
}

/**
 * Helper function to create judge profile
 */
async function createJudgeProfile(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'hackathon.judge.demo@gmail.com',
        name: 'Hackathon Judge',
        xp: 1000,
        level: 10,
        streak: 7,
      });

    if (error && !error.message.includes('duplicate')) {
      console.error('Failed to create judge profile:', error);
    }
  } catch (error) {
    console.error('Error creating judge profile:', error);
  }
}

