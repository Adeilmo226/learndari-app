package com.rork.learndariandroid.ui.screens

import androidx.lifecycle.ViewModel
import com.rork.learndariandroid.domain.LessonSession
import com.rork.learndariandroid.domain.SessionState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Holds one running [LessonSession] across recompositions and rotation.
 *
 * The session itself is a plain mutating class ported from iOS, so every action
 * re-publishes a fresh immutable snapshot for Compose to diff against.
 */
class LessonSessionViewModel(private val session: LessonSession) : ViewModel() {

    private val _state = MutableStateFlow(session.snapshot())
    val state: StateFlow<SessionState> = _state.asStateFlow()

    fun submit(correct: Boolean) {
        session.submit(correct)
        _state.value = session.snapshot()
    }

    fun submitMatch(firstTryCorrect: Set<String>, missed: Set<String>) {
        session.submitMatch(firstTryCorrect, missed)
        _state.value = session.snapshot()
    }
}
