# 🐛 Troubleshooting Guide

## **Common Issues & Quick Fixes**

This guide helps resolve the most common issues users encounter with the Interactive CV Platform. Issues are organized by category with step-by-step solutions.

## **🚨 Critical Issues (Platform Won't Load)**

### **Issue: Blank Screen or Loading Forever**

#### **Symptoms**
- Page loads but shows only blank green screen
- Loading indicator spins indefinitely
- No GameBoy interface appears

#### **Quick Solutions**
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Del → Clear "Cached images and files"
   - Firefox: Ctrl+Shift+Del → Clear "Cache"
   - Safari: Cmd+Option+E
3. **Try a different browser** (Chrome or Edge recommended)
4. **Disable browser extensions** temporarily
5. **Check JavaScript is enabled** in browser settings

#### **Advanced Solutions**
```bash
# Check browser console for errors
1. Press F12 to open developer tools
2. Go to Console tab
3. Look for red error messages
4. Common errors and fixes:

Error: "Failed to load module"
Fix: Clear cache and reload

Error: "WebGL context lost"
Fix: Restart browser, update graphics drivers

Error: "Out of memory"
Fix: Close other tabs, restart browser
```

### **Issue: JavaScript Errors**

#### **Symptoms**
- Console shows JavaScript errors
- Interface partially loads but doesn't respond
- Buttons don't work

#### **Solutions**
1. **Update browser** to latest version
2. **Disable ad blockers** for the site
3. **Enable JavaScript** in browser settings
4. **Try incognito/private browsing mode**
5. **Check for browser extensions conflicts**

## **🎮 Interface & Navigation Issues**

### **Issue: Character Won't Move**

#### **Symptoms**
- Arrow keys don't move player
- Touch controls unresponsive
- Player stuck in one position

#### **Desktop Solutions**
1. **Click on the game area** to focus the canvas
2. **Check if a dialog is open** (press ESC to close)
3. **Try different arrow keys** to ensure it's not a keyboard issue
4. **Refresh the page** if movement is completely broken

#### **Mobile Solutions**
1. **Try tapping and holding** in different screen areas
2. **Rotate device** to portrait orientation
3. **Zoom out** to see full interface
4. **Clear browser cache** and reload

### **Issue: Touch Controls Not Working (Mobile)**

#### **Symptoms**
- Tapping doesn't move character
- Interactions don't respond to touch
- Interface appears but no touch response

#### **Solutions**
1. **Use single finger taps** (not multi-touch)
2. **Tap and hold** for movement (not quick taps)
3. **Try landscape orientation** for better touch areas
4. **Disable browser zoom** (use pinch to zoom out to 100%)
5. **Clear mobile browser data** completely

### **Issue: Dialogs Won't Close**

#### **Symptoms**
- Modal dialogs stay open
- ESC key doesn't work
- Clicking outside dialog doesn't close it

#### **Solutions**
1. **Press ESC key multiple times**
2. **Click the X button** if visible
3. **Refresh the page** to reset interface
4. **Try different browser** if issue persists

## **🤖 AI Model Issues**

### **Issue: Models Won't Load**

#### **Symptoms**
- "Loading..." message never completes
- Error messages about model loading
- AI responses never appear

#### **Quick Fixes**
1. **Check internet connection** (models download from internet)
2. **Try smaller model first** (DistilBERT instead of Phi-3)
3. **Disable VPN** if using one
4. **Wait longer** (Phi-3 can take 10+ minutes on slow connections)
5. **Clear browser storage**:
   ```javascript
   // In browser console (F12):
   localStorage.clear();
   location.reload();
   ```

#### **Network-Specific Solutions**
```bash
# Test connection to model servers
1. Open browser console (F12)
2. Type: fetch('https://huggingface.co').then(r => console.log(r.status))
3. Should show: 200

# For slow connections (< 5 Mbps):
1. Use DistilBERT only (65MB vs 1.8GB)
2. Wait for off-peak hours
3. Switch to WiFi if using cellular

# For blocked connections:
1. Disable firewall/antivirus temporarily
2. Try different network
3. Check corporate proxy settings
```

### **Issue: Consent Dialog Appears Repeatedly**

#### **Symptoms**
- Download consent dialog shows every time
- "Remember my choice" doesn't work
- Previously approved models ask again

#### **Solutions**
1. **Check browser privacy settings** (may block localStorage)
2. **Disable private browsing** (doesn't save preferences)
3. **Allow cookies for the site**
4. **Clear and reset preferences**:
   ```javascript
   // Reset consent in browser console:
   localStorage.removeItem('phi3_model_consent_phi3');
   localStorage.removeItem('phi3_download_state_phi3');
   ```

### **Issue: Download Progress Bar Stuck**

#### **Symptoms**
- Progress bar stops at certain percentage
- No speed or time information shown
- Download seems frozen

#### **Solutions**
1. **Wait longer** (progress may update in chunks)
2. **Check network stability** (download may have paused)
3. **Cancel and retry** download
4. **Try smaller model** if connection is unreliable
5. **Close other bandwidth-heavy applications**

### **Issue: AI Responses Are Poor Quality**

#### **Symptoms**
- Generic or irrelevant responses
- AI doesn't understand CV-related questions
- Responses seem random or confused

#### **Diagnosis & Solutions**
1. **Check which model is active** (shown in conversation interface)
2. **Try different model**:
   - DistilBERT: Best for direct questions
   - Qwen: Better for conversations
   - Phi-3: Most sophisticated responses

3. **Improve your questions**:
   ```
   Instead of: "Tell me about yourself"
   Try: "What data science experience do you have?"
   
   Instead of: "What skills?"
   Try: "What Python frameworks have you used?"
   ```

4. **Check for model loading completion**:
   - Look for "Model loaded successfully" message
   - Verify no download progress bars are active

## **📱 Mobile-Specific Issues**

### **Issue: Interface Too Small on Mobile**

#### **Symptoms**
- Text is tiny and unreadable
- Buttons too small to tap
- Interface doesn't fit screen

#### **Solutions**
1. **Rotate to portrait orientation**
2. **Pinch to zoom out** to 100% browser zoom
3. **Use mobile-optimized browser** (Chrome Mobile recommended)
4. **Clear browser cache** to reset viewport settings

### **Issue: iOS Safari Problems**

#### **Symptoms**
- AI models don't work at all
- Gets stuck on loading screens
- Interface behaves strangely

#### **Why This Happens**
iOS Safari has limited support for WebAssembly and AI models. The platform automatically detects this and provides fallback responses.

#### **Solutions**
1. **This is expected behavior** on iOS
2. **Use fallback response system** (still provides CV information)
3. **Switch to desktop** for full AI experience
4. **Try Chrome iOS** (same limitations but may be more stable)

### **Issue: Android Performance Problems**

#### **Symptoms**
- Interface is very slow or laggy
- App crashes or freezes
- Models take extremely long to load

#### **Solutions**
1. **Close other apps** to free memory
2. **Use WiFi instead of cellular**
3. **Try Chrome browser** (best Android support)
4. **Stick to DistilBERT model** for performance
5. **Clear browser data completely**

## **🌐 Network & Connection Issues**

### **Issue: Very Slow Model Downloads**

#### **Symptoms**
- Downloads taking hours
- Speed shows < 1 Mbps
- Frequent download interruptions

#### **Connection Diagnosis**
```bash
# Test your connection speed
1. Go to https://fast.com or https://speedtest.net
2. Compare results to platform's network detection
3. If speeds don't match, there may be throttling

# For slow connections:
1. Download during off-peak hours
2. Close streaming services/downloads
3. Switch from WiFi to ethernet if possible
4. Contact ISP if speeds are much slower than expected
```

#### **Solutions by Connection Speed**
- **< 2 Mbps**: Use DistilBERT only (65MB)
- **2-10 Mbps**: Qwen acceptable (500MB), avoid Phi-3
- **> 10 Mbps**: All models reasonable

### **Issue: Downloads Keep Failing**

#### **Symptoms**
- Download starts but stops with error
- Network error messages
- "Failed to fetch" errors

#### **Solutions**
1. **Check connection stability**:
   ```bash
   # Test connection consistency
   ping -c 10 huggingface.co
   # Should show consistent response times
   ```

2. **Disable VPN/Proxy** temporarily
3. **Try different network** (mobile hotspot, etc.)
4. **Restart router/modem**
5. **Contact network administrator** if on corporate network

## **💻 Browser-Specific Issues**

### **Chrome Issues**

#### **WebGPU Not Working**
```bash
# Check WebGPU status
1. Go to chrome://gpu/
2. Look for "WebGPU: Hardware accelerated"
3. If disabled, go to chrome://flags/#webgpu and enable

# Clear Chrome data
1. chrome://settings/clearBrowserData
2. Select "All time" and all options
3. Clear data and restart Chrome
```

### **Firefox Issues**

#### **Models Load Slowly**
```bash
# Enable Firefox optimizations
1. Type about:config in address bar
2. Set dom.webgpu.enabled = true
3. Set gfx.webrender.all = true
4. Restart Firefox
```

### **Safari Issues**

#### **Limited Functionality**
Safari has inherent limitations. Solutions:
1. **Use Chrome or Firefox** for full experience
2. **Accept limited AI functionality**
3. **Update to latest Safari version**
4. **Enable Developer features**:
   - Safari > Preferences > Advanced > Show Develop menu
   - Develop > Experimental Features > Enable WebAssembly features

## **🔧 Advanced Troubleshooting**

### **Complete Reset Procedure**

If nothing else works, perform a complete reset:

#### **Step 1: Clear All Browser Data**
```bash
# Chrome
1. chrome://settings/clearBrowserData
2. Select "All time" and ALL options
3. Clear data

# Firefox  
1. about:preferences#privacy
2. Clear Data > Select all options
3. Clear

# Safari
1. Safari > Preferences > Privacy
2. Manage Website Data > Remove All
```

#### **Step 2: Reset Platform Preferences**
```javascript
// In browser console (F12 > Console):
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('ai-models');
location.reload();
```

#### **Step 3: Test Basic Functionality**
1. Load page and verify GameBoy interface appears
2. Test movement with arrow keys or touch
3. Navigate to Boss Room
4. Start conversation with DistilBERT model only
5. Test one simple question

### **Performance Monitoring**

#### **Check System Resources**
```javascript
// Monitor memory usage (Chrome console):
const memInfo = performance.memory;
console.log({
  used: Math.round(memInfo.usedJSHeapSize / 1048576) + 'MB',
  total: Math.round(memInfo.totalJSHeapSize / 1048576) + 'MB',
  limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + 'MB'
});

// If used > 80% of limit, close other tabs or restart browser
```

#### **Check Network Performance**
```javascript
// Test connection speed (console):
const connection = navigator.connection;
if (connection) {
  console.log('Connection:', {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt
  });
}
```

## **📞 When to Seek Further Help**

### **Contact for These Issues**
- Platform completely broken across all browsers
- Consistent errors that reset doesn't fix
- Feature requests or suggestions
- Accessibility concerns

### **Information to Provide When Reporting Issues**
1. **Browser and version** (e.g., "Chrome 120.0.6099.109")
2. **Operating system** (e.g., "Windows 11", "macOS Ventura")
3. **Device type** (e.g., "Desktop", "iPhone 12", "Android tablet")
4. **Connection speed** (from speedtest.net)
5. **Exact error messages** (screenshot preferred)
6. **Steps to reproduce** the issue
7. **Browser console output** (F12 > Console tab)

### **Quick Debug Info Collection**
```javascript
// Run this in browser console and include output when reporting issues:
console.log('Debug Info:', {
  browser: navigator.userAgent,
  memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'Unknown',
  connection: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
  webgpu: navigator.gpu ? 'Available' : 'Not available',
  localStorage: localStorage.length + ' items stored',
  timestamp: new Date().toISOString()
});
```

This troubleshooting guide covers the majority of issues users may encounter. Most problems have simple solutions, and the platform is designed to gracefully handle various limitations and provide fallback functionality when needed.