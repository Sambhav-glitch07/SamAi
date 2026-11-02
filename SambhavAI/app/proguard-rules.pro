# Proguard rules for SambhavAI
-keep class com.sambhavai.assistant.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
