package com.sambhavai.assistant.ui

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.LinearInterpolator
import androidx.core.content.ContextCompat
import com.sambhavai.assistant.R

/**
 * Custom Android View that renders an animated luminous liquid-glass border
 * with 4 distinct states: IDLE, LISTENING, THINKING, SPEAKING.
 * Hardware accelerated, highly optimized for Samsung Galaxy M30s.
 */
class GlowingBorderView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var assistantState: AssistantState = AssistantState.IDLE
        set(value) {
            if (field != value) {
                field = value
                updateStateAnimation()
            }
        }

    var glowIntensity: Float = 1.0f
        set(value) {
            field = value.coerceIn(0.1f, 1.5f)
            invalidate()
        }

    var strokeWidthPx: Float = 10f
        set(value) {
            field = value
            borderPaint.strokeWidth = value
            glowPaint.strokeWidth = value * 2.2f
            invalidate()
        }

    var cornerRadiusPx: Float = 60f
        set(value) {
            field = value
            invalidate()
        }

    private var audioAmplitude: Float = 0f

    // Animators
    private var breathAnimator: ValueAnimator? = null
    private var lightSweepAnimator: ValueAnimator? = null
    private var thinkingPulseAnimator: ValueAnimator? = null
    private var speakingFlowAnimator: ValueAnimator? = null

    // Animation progress values
    private var breathProgress: Float = 0f
    private var sweepProgress: Float = 0f
    private var thinkingPulse: Float = 0f
    private var speakingPhase: Float = 0f

    // Drawing paths and paints
    private val borderRect = RectF()
    private val borderPath = Path()

    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }

    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        maskFilter = BlurMaskFilter(18f, BlurMaskFilter.Blur.NORMAL)
    }

    // Color definitions
    private val colorIdleBlue = Color.parseColor("#3366FF")
    private val colorIdleWhite = Color.parseColor("#E0F7FA")
    private val colorCyanBright = Color.parseColor("#00E5FF")
    private val colorCyanDeep = Color.parseColor("#0091EA")
    private val colorPurple = Color.parseColor("#7C4DFF")
    private val colorViolet = Color.parseColor("#B388FF")
    private val colorSpeakingWhite = Color.parseColor("#FFFFFF")

    init {
        // Enable software layer for BlurMaskFilter compatibility if needed, or hardware layer
        setLayerType(LAYER_TYPE_SOFTWARE, null)

        attrs?.let {
            val typedArray = context.obtainStyledAttributes(it, R.styleable.GlowingBorderView)
            strokeWidthPx = typedArray.getDimension(R.styleable.GlowingBorderView_borderWidth, 10f)
            cornerRadiusPx = typedArray.getDimension(R.styleable.GlowingBorderView_cornerRadius, 60f)
            glowIntensity = typedArray.getFloat(R.styleable.GlowingBorderView_glowIntensity, 1.0f)
            val stateOrdinal = typedArray.getInt(R.styleable.GlowingBorderView_assistantState, 0)
            assistantState = AssistantState.values().getOrElse(stateOrdinal) { AssistantState.IDLE }
            typedArray.recycle()
        }

        setupAnimators()
        updateStateAnimation()
    }

    private fun setupAnimators() {
        // IDLE: Slow breathing animation (3000ms loop)
        breathAnimator = ValueAnimator.ofFloat(0.25f, 0.85f).apply {
            duration = 3200
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener {
                breathProgress = it.animatedValue as Float
                if (assistantState == AssistantState.IDLE) invalidate()
            }
        }

        // LISTENING: Animated beam traveling around the perimeter (2200ms)
        lightSweepAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 2400
            repeatMode = ValueAnimator.RESTART
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener {
                sweepProgress = it.animatedValue as Float
                if (assistantState == AssistantState.LISTENING) invalidate()
            }
        }

        // THINKING: Purple-blue pulsating wave (1400ms)
        thinkingPulseAnimator = ValueAnimator.ofFloat(0.3f, 1f).apply {
            duration = 1400
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener {
                thinkingPulse = it.animatedValue as Float
                if (assistantState == AssistantState.THINKING) invalidate()
            }
        }

        // SPEAKING: Flowing cyan-white wave (1800ms)
        speakingFlowAnimator = ValueAnimator.ofFloat(0f, 360f).apply {
            duration = 1800
            repeatMode = ValueAnimator.RESTART
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener {
                speakingPhase = it.animatedValue as Float
                if (assistantState == AssistantState.SPEAKING) invalidate()
            }
        }
    }

    private fun updateStateAnimation() {
        breathAnimator?.cancel()
        lightSweepAnimator?.cancel()
        thinkingPulseAnimator?.cancel()
        speakingFlowAnimator?.cancel()

        when (assistantState) {
            AssistantState.IDLE -> breathAnimator?.start()
            AssistantState.LISTENING -> lightSweepAnimator?.start()
            AssistantState.THINKING -> thinkingPulseAnimator?.start()
            AssistantState.SPEAKING -> speakingFlowAnimator?.start()
        }
        invalidate()
    }

    fun setAudioAmplitude(amplitude: Float) {
        this.audioAmplitude = amplitude.coerceIn(0f, 1f)
        if (assistantState == AssistantState.LISTENING || assistantState == AssistantState.SPEAKING) {
            invalidate()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = strokeWidthPx * 1.5f
        borderRect.set(inset, inset, w.toFloat() - inset, h.toFloat() - inset)

        borderPath.reset()
        borderPath.addRoundRect(borderRect, cornerRadiusPx, cornerRadiusPx, Path.Direction.CW)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (width <= 0 || height <= 0) return

        val w = width.toFloat()
        val h = height.toFloat()

        when (assistantState) {
            AssistantState.IDLE -> {
                // Subtle blue-white border glow with gentle breathing
                val alpha = (breathProgress * 255 * glowIntensity).toInt().coerceIn(30, 240)
                val shader = LinearGradient(
                    0f, 0f, w, h,
                    intArrayOf(colorIdleBlue, colorIdleWhite, colorIdleBlue),
                    floatArrayOf(0f, 0.5f, 1f),
                    Shader.TileMode.CLAMP
                )
                borderPaint.shader = shader
                borderPaint.alpha = alpha

                glowPaint.shader = shader
                glowPaint.alpha = (alpha * 0.45f).toInt()

                canvas.drawPath(borderPath, glowPaint)
                canvas.drawPath(borderPath, borderPaint)
            }

            AssistantState.LISTENING -> {
                // Bright cyan glowing border with light traveling around edges
                val audioBoost = (audioAmplitude * 60).toInt()
                val alpha = ((200 + audioBoost) * glowIntensity).toInt().coerceIn(120, 255)

                // Sweep gradient rotating around center
                val matrix = Matrix()
                matrix.setRotate(sweepProgress * 360f, w / 2f, h / 2f)

                val sweepGradient = SweepGradient(
                    w / 2f, h / 2f,
                    intArrayOf(colorCyanBright, colorCyanDeep, Color.TRANSPARENT, colorCyanBright),
                    floatArrayOf(0f, 0.4f, 0.8f, 1f)
                )
                sweepGradient.setLocalMatrix(matrix)

                borderPaint.shader = sweepGradient
                borderPaint.alpha = alpha
                borderPaint.strokeWidth = strokeWidthPx * (1f + audioAmplitude * 0.4f)

                glowPaint.shader = sweepGradient
                glowPaint.alpha = (alpha * 0.7f).toInt()
                glowPaint.strokeWidth = strokeWidthPx * (2.4f + audioAmplitude * 0.8f)

                canvas.drawPath(borderPath, glowPaint)
                canvas.drawPath(borderPath, borderPaint)
            }

            AssistantState.THINKING -> {
                // Purple-blue animated edge lighting, smooth pulsing effect
                val alpha = (thinkingPulse * 255 * glowIntensity).toInt().coerceIn(80, 255)
                val sweepGradient = SweepGradient(
                    w / 2f, h / 2f,
                    intArrayOf(colorPurple, colorViolet, colorIdleBlue, colorPurple),
                    floatArrayOf(0f, 0.33f, 0.66f, 1f)
                )
                val matrix = Matrix()
                matrix.setRotate(thinkingPulse * 180f, w / 2f, h / 2f)
                sweepGradient.setLocalMatrix(matrix)

                borderPaint.shader = sweepGradient
                borderPaint.alpha = alpha
                borderPaint.strokeWidth = strokeWidthPx * (0.9f + thinkingPulse * 0.3f)

                glowPaint.shader = sweepGradient
                glowPaint.alpha = (alpha * 0.6f).toInt()
                glowPaint.strokeWidth = strokeWidthPx * (2.0f + thinkingPulse * 0.8f)

                canvas.drawPath(borderPath, glowPaint)
                canvas.drawPath(borderPath, borderPaint)
            }

            AssistantState.SPEAKING -> {
                // Flowing cyan-white edge lighting synchronized approximately with speech
                val audioMod = (audioAmplitude * 0.5f)
                val alpha = ((210 + audioAmplitude * 45) * glowIntensity).toInt().coerceIn(150, 255)

                val sweepGradient = SweepGradient(
                    w / 2f, h / 2f,
                    intArrayOf(colorSpeakingWhite, colorCyanBright, colorIdleBlue, colorSpeakingWhite),
                    floatArrayOf(0f, 0.35f, 0.7f, 1f)
                )
                val matrix = Matrix()
                matrix.setRotate(speakingPhase, w / 2f, h / 2f)
                sweepGradient.setLocalMatrix(matrix)

                borderPaint.shader = sweepGradient
                borderPaint.alpha = alpha
                borderPaint.strokeWidth = strokeWidthPx * (1.1f + audioMod)

                glowPaint.shader = sweepGradient
                glowPaint.alpha = (alpha * 0.65f).toInt()
                glowPaint.strokeWidth = strokeWidthPx * (2.2f + audioMod * 1.5f)

                canvas.drawPath(borderPath, glowPaint)
                canvas.drawPath(borderPath, borderPaint)
            }
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        breathAnimator?.cancel()
        lightSweepAnimator?.cancel()
        thinkingPulseAnimator?.cancel()
        speakingFlowAnimator?.cancel()
    }
}
