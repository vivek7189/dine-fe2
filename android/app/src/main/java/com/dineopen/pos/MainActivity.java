package com.dineopen.pos;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.dineopen.printer.DinePrinterPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DinePrinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
