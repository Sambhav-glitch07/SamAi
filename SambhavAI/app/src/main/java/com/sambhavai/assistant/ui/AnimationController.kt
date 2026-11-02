package com.sambhavai.assistant.ui

/**
 * Controller that binds and synchronizes the central OrbView and the GlowingBorderView.
 */
class AnimationController(
    private val orbView: AssistantOrbView?,
    private val borderView: GlowingBorderView?
) {

    fun setState(state: AssistantState) {
        orbView?.assistantState = state
        borderView?.assistantState = state
    }

    fun setAudioLevel(rmsDb: Float) {
        // Normalize RMS dB (typically -2 to 10 dB from Android SpeechRecognizer) to 0.0 - 1.0 range
        val normalized = ((rmsDb + 2f) / 12f).coerceIn(0f, 1f)
        orbView?.setAudioAmplitude(normalized)
        borderView?.setAudioAmplitude(normalized)
    }

    fun reset() {
        setState(AssistantState.IDLE)
        orbView?.setAudioAmplitude(0f)
        borderView?.setAudioAmplitude(0f)
    }
}
