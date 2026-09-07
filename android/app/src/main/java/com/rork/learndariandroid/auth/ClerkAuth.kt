package com.rork.learndariandroid.auth

import com.clerk.api.Clerk
import com.clerk.api.signin.SignIn
import com.clerk.api.sso.OAuthProvider

/**
 * Thin wrapper over the Clerk SDK for the two things the UI needs: start an
 * OAuth sign-in, and sign out. Signed-in state is observed directly from
 * `Clerk.userFlow` in the composables.
 */
object ClerkAuth {
    suspend fun signInWithGoogle() = oauth(OAuthProvider.GOOGLE)

    suspend fun signInWithApple() = oauth(OAuthProvider.APPLE)

    private suspend fun oauth(provider: OAuthProvider) {
        SignIn.authenticateWithRedirect(
            SignIn.AuthenticateWithRedirectParams.OAuth(provider = provider),
        )
    }

    suspend fun signOut() {
        Clerk.auth.signOut()
    }
}
