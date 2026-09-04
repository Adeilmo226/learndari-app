package com.rork.learndariandroid.data

import com.rork.learndariandroid.Config

/**
 * Where the app fetches published content and audio from.
 *
 * Reads the injected environment value when one is present, and otherwise falls
 * back to the project's deployed Worker. The URL is public, so shipping it as a
 * default is safe and means a fresh checkout still has working audio.
 */
object Backend {
    private const val DEFAULT_BASE_URL = "https://learndari-backend.rork.app"

    val baseUrl: String
        get() = Config.allValues["EXPO_PUBLIC_RORK_FUNCTIONS_URL"]
            ?.trim()
            ?.trimEnd('/')
            ?.takeIf { it.isNotEmpty() }
            ?: DEFAULT_BASE_URL
}
