package com.romflasher.app;

import android.content.Context;
import android.os.Build;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.webkit.JavascriptInterface;

public class WebAppInterface {
    private final Context context;
    private final Vibrator vibrator;

    public WebAppInterface(Context c) {
        this.context = c;
        this.vibrator = (Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @JavascriptInterface
    public void vibrate(long milliseconds) {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(milliseconds);
            }
        }
    }
}
