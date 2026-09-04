package com.rork.learndariandroid

import android.app.Application
import com.rork.learndariandroid.audio.AudioService
import com.rork.learndariandroid.data.ContentRepository
import com.rork.learndariandroid.data.ProgressStore

/**
 * Single place the app's long-lived services are created.
 *
 * Deliberately plain: three objects, one owner, no dependency-injection
 * ceremony for a graph this small.
 */
object AppGraph {
    lateinit var content: ContentRepository
        private set
    lateinit var progress: ProgressStore
        private set
    lateinit var audio: AudioService
        private set

    fun init(application: Application) {
        content = ContentRepository(application)
        progress = ProgressStore(application)
        audio = AudioService(application)
    }
}

class LearnDariApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AppGraph.init(this)
    }
}
