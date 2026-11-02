package com.sambhavai.assistant.ui

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.LinearInterpolator
import com.sambhavai.assistant.R
import kotlin.math.cos
import kotlin.math.sin

/**
 * Futuristic JARVIS / iOS Liquid Glass Central Orb View.
 * Renders glowing concentric energy rings, refraction core, and reactive particle fields.
 */
class AssistantOrbView @JvmOverloads constructor(
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

    private var audioAmplitude: Float = 0f

    // Animators
    private var rotationAnimator: ValueAnimator? = null
    private var pulseAnimator: ValueAnimator? = null
    private var waveAnimator: ValueAnimator? = null

    private var rotationAngle: Float = 0f
    private var pulseScale: Float = 1.0f
    private var wavePhase: Float = 0f

    // Paints
    private val corePaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val ringPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }
    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        maskFilter = BlurMaskFilter(24f, BlurMaskFilter.Blur.NORMAL)
    }
    private val particlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    // Colors
    private val cyanGlow = Color.parseColor("#00E5FF")
    private val blueGlow = Color.parseColor("#2979FF")
    private val purpleGlow = Color.parseColor("#7C4DFF")
    private val violetGlow = Color.parseColor("#B388FF")
    private val whiteGlow = Color.parseColor("#FFFFFF")

    init {
        setLayerType(LAYER_TYPE_SOFTWARE, null)

        attrs?.let {
            val a = context.obtainStyledAttributes(it, R.styleable.AssistantOrbView)
            val stateOrdinal = a.getInt(R.styleable.AssistantOrbView_orbState, 0)
            assistantState = AssistantState.values().getOrElse(stateOrdinal) { AssistantState.IDLE }
            a.recycle()
        }

        setupAnimators()
        updateStateAnimation()
    }

    private fun setupAnimators() {
        rotationAnimator = ValueAnimator.ofFloat(0f, 360f).apply {
            duration = 8000
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.RESTART
            interpolator = LinearInterpolator()
            addUpdateListener {
                rotationAngle = it.animatedValue as Float
                invalidate()
            }
        }

        pulseAnimator = ValueAnimator.ofFloat(0.92f, 1.08f).apply {
            duration = 2400
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener {
                pulseScale = it.animatedValue as Float
                if (assistantState == AssistantState.IDLE) invalidate()
            }
        }

        waveAnimator = ValueAnimator.ofFloat(0f, Math.PI.toFloat() * 2f).apply {
            duration = 1600
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.RESTART
            interpolator = LinearInterpolator()
            addUpdateListener {
                wavePhase = it.animatedValue as Float
                if (assistantState != AssistantState.IDLE) invalidate()
            }
        }

        rotationAnimator?.start()
        pulseAnimator?.start()
        waveAnimator?.start()
    }

    private fun updateStateAnimation() {
        when (assistantState) {
            AssistantState.IDLE -> {
                rotationAnimator?.duration = 8000
                pulseAnimator?.duration = 2600
            }
            AssistantState.LISTENING -> {
                rotationAnimator?.duration = 3500
                pulseAnimator?.duration = 1200
            }
            AssistantState.THINKING -> {
                rotationAnimator?.duration = 1800
                pulseAnimator?.duration = 800
            }
            AssistantState.SPEAKING -> {
                rotationAnimator?.duration = 3000
                pulseAnimator?.duration = 1400
            }
        }
        invalidate()
    }

    fun setAudioAmplitude(amplitude: Float) {
        this.audioAmplitude = amplitude.coerceIn(0f, 1f)
        if (assistantState == AssistantState.LISTENING || assistantState == AssistantState.SPEAKING) {
            invalidate()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (width <= 0 || height <= 0) return

        val cx = width / 2f
        val cy = height / 2f
        val baseRadius = (minOf(width, height) / 2f) * 0.42f
        val effectiveScale = pulseScale + (audioAmplitude * 0.35f)
        val currentRadius = baseRadius * effectiveScale

        // Colors per state
        val (primaryColor, secondaryColor, accentColor) = when (assistantState) {
            AssistantState.IDLE -> Triple(blueGlow, cyanGlow, whiteGlow)
            AssistantState.LISTENING -> Triple(cyanGlow, blueGlow, whiteGlow)
            AssistantState.THINKING -> Triple(purpleGlow, violetGlow, blueGlow)
            AssistantState.SPEAKING -> Triple(cyanGlow, whiteGlow, blueGlow)
        }

        // 1. Outer ambient glow aura
        glowPaint.color = primaryColor
        glowPaint.alpha = (70 * effectiveScale).toInt().coerceIn(30, 160)
        canvas.drawCircle(cx, cy, currentRadius * 1.5f, glowPaint)

        // 2. Concentric Orbiting Energy Rings
        canvas.save()
        canvas.rotate(rotationAngle, cx, cy)

        ringPaint.strokeWidth = 3f
        ringPaint.color = secondaryColor
        ringPaint.alpha = 140
        val ringRect1 = RectF(
            cx - currentRadius * 1.25f,
            cy - currentRadius * 0.85f,
            cx + currentRadius * 1.25f,
            cy + currentRadius * 0.85f
        )
        canvas.drawOval(ringRect1, ringPaint)

        canvas.rotate(60f, cx, cy)
        ringPaint.color = accentColor
        ringPaint.alpha = 110
        val ringRect2 = RectF(
            cx - currentRadius * 1.15f,
            cy - currentRadius * 0.75f,
            cx + currentRadius * 1.15f,
            cy + currentRadius * 0.75f
        )
        canvas.drawOval(ringRect2, ringPaint)
        canvas.restore()

        // 3. Central Fluid Radial Gradient Core
        val coreGradient = RadialGradient(
            cx - currentRadius * 0.2f,
            cy - currentRadius * 0.25f,
            currentRadius * 1.2f,
            intArrayOf(accentColor, primaryColor, secondaryColor, Color.TRANSPARENT),
            floatArrayOf(0f, 0.45f, 0.85f, 1f),
            Shader.TileMode.CLAMP
        )
        corePaint.shader = coreGradient
        corePaint.alpha = 240
        canvas.drawCircle(cx, cy, currentRadius, corePaint)

        // 4. Inner Highlights (Liquid Glass lens refraction)
        val glassLens = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.5f
            color = Color.WHITE
            alpha = 120
        }
        canvas.drawCircle(cx, cy, currentRadius * 0.96f, glassLens)

        // 5. Orbital Sparkles / Data Particles
        particlePaint.color = accentColor
        val particleCount = 8
        for (i in 0 until particleCount) {
            val angle = (rotationAngle * 1.5f) + (i * (360f / particleCount))
            val rad = Math.toRadians(angle.toDouble())
            val dist = currentRadius * (1.18f + 0.12f * sin(wavePhase + i))
            val px = cx + (dist * cos(rad)).toFloat()
            val py = cy + (dist * sin(rad)).toFloat()
            particlePaint.alpha = (160 + 80 * sin(wavePhase + i)).toInt().coerceIn(60, 255)
            canvas.drawCircle(px, py, 3.5f + (audioAmplitude * 2.5f), particlePaint)
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        rotationAnimator?.cancel()
        pulseAnimator?.cancel()
        waveAnimator?.cancel()
    }
}
