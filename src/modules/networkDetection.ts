// modules/networkDetection.ts - Network speed detection and warnings

interface NetworkInfo {
  speed: number; // Mbps
  confidence: "high" | "medium" | "low";
  method: "connection_api" | "speed_test" | "estimate";
  warning?: string;
}

// Test files for speed measurement - using DistilBERT model as primary benchmark
const TEST_FILES = [
  {
    url: "https://huggingface.co/Tesslate/UIGEN-X-32B-0727/resolve/main/tokenizer.json", // ~65MB DistilBERT model
    sizeKB: 10 * 1024, // ~10MB for very accurate speed measurement
    description: "UI Gen X tokenizer.json (11MB)",
  },
  {
    url: "https://huggingface.co/distilbert-base-uncased/resolve/main/pytorch_model.bin", // ~65MB DistilBERT model
    sizeKB: 66560, // ~65MB for very accurate speed measurement
    description: "DistilBERT PyTorch model (65MB)",
  },
  {
    url: "/assets/CV_Pedrani.pdf", // Local 6MB PDF fallback
    sizeKB: 6144, // ~6MB backup test
    description: "Local CV PDF (6MB)",
  },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js",
    sizeKB: 71, // Small reliable CDN fallback (~71KB)
    description: "Lodash CDN (71KB)",
  },
];

export async function detectNetworkSpeed(): Promise<NetworkInfo> {
  console.log("🔍 Detecting network speed...");

  // Method 1: Real speed test with actual file download (PRIMARY - most accurate)
  try {
    const speedTestResult = await performSpeedTest();
    console.log(`⚡ Speed test result: ${speedTestResult.speed} Mbps`);

    return {
      speed: speedTestResult.speed,
      confidence: speedTestResult.confidence,
      method: "speed_test",
      warning:
        speedTestResult.speed < 1.5
          ? `Slow connection detected (${speedTestResult.speed.toFixed(
              1
            )} Mbps). Large model download not recommended.`
          : speedTestResult.speed < 5
          ? `Moderate connection speed (${speedTestResult.speed.toFixed(
              1
            )} Mbps). Download may take 10+ minutes.`
          : undefined,
    };
  } catch (error) {
    console.warn("⚠️ Real speed test failed, trying fallback methods:", error);
  }

  // Method 2: Network Information API as fallback (often inaccurate)
  const connectionInfo = getConnectionAPI();
  if (connectionInfo.speed > 0) {
    console.log(
      `📡 Network API fallback: ${connectionInfo.speed} Mbps (may be theoretical limit)`
    );
    return {
      speed: connectionInfo.speed,
      confidence: "low", // Downgraded confidence since it's often wrong
      method: "connection_api",
      warning: `Connection API reports ${connectionInfo.speed} Mbps, but actual speed may vary significantly.`,
    };
  }

  // Method 3: Conservative estimate (last resort)
  console.log("📊 Using conservative speed estimate");
  return {
    speed: 2.5, // Conservative estimate
    confidence: "low",
    method: "estimate",
    warning:
      "Could not detect connection speed. Download time may vary significantly.",
  };
}

function getConnectionAPI(): { speed: number } {
  // Check for Network Information API
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (connection && connection.downlink) {
    return { speed: connection.downlink };
  }

  return { speed: 0 };
}

async function performSpeedTest(): Promise<{
  speed: number;
  confidence: "high" | "medium" | "low";
}> {
  // Try each test file until one works
  for (const testFile of TEST_FILES) {
    try {
      console.log(`📊 Testing download speed with: ${testFile.description}`);
      const startTime = Date.now();

      const response = await fetch(testFile.url, {
        cache: "no-store", // Ensure fresh download
        method: "GET",
        signal: AbortSignal.timeout(60000), // 60 second timeout for large model
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.blob();
      const endTime = Date.now();

      const downloadTimeSeconds = (endTime - startTime) / 1000;
      const downloadSizeBytes = data.size;
      const downloadSizeKB = downloadSizeBytes / 1024;
      const downloadSizeMB = downloadSizeKB / 1024;

      // Calculate speed in Mbps: (MB * 8 bits) / seconds = Mbps
      const speedMbps = (downloadSizeMB * 8) / downloadTimeSeconds;

      console.log(
        `📊 Download details: ${downloadSizeBytes} bytes (${downloadSizeKB.toFixed(
          1
        )}KB) in ${downloadTimeSeconds.toFixed(2)}s`
      );
      console.log(
        `📊 Speed calculation: ${downloadSizeMB.toFixed(
          2
        )}MB * 8 / ${downloadTimeSeconds.toFixed(2)}s = ${speedMbps.toFixed(
          2
        )} Mbps`
      );

      // Determine confidence based on test duration and size
      let confidence: "high" | "medium" | "low" = "medium";
      if (downloadTimeSeconds < 1) {
        confidence = "low"; // Too fast to be accurate
      } else if (downloadTimeSeconds > 5 && downloadSizeMB > 50) {
        confidence = "high"; // Excellent test with DistilBERT model (65MB+)
      } else if (downloadTimeSeconds > 3 && downloadSizeMB > 1) {
        confidence = "high"; // Good test duration and substantial size (>1MB)
      } else if (downloadTimeSeconds > 2 && downloadSizeKB > 500) {
        confidence = "medium"; // Reasonable test with medium file
      }

      console.log(
        `📊 Speed test details: ${downloadSizeKB.toFixed(
          0
        )}KB in ${downloadTimeSeconds.toFixed(2)}s = ${speedMbps.toFixed(
          1
        )} Mbps`
      );
      console.log(`✅ Speed test successful using: ${testFile.url}`);
      console.log(
        `🚀 Measured speed: ${speedMbps.toFixed(
          1
        )} Mbps (confidence: ${confidence})`
      );

      return {
        speed: Math.max(speedMbps, 0.1), // Minimum 0.1 Mbps
        confidence,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const isCorsError =
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch");

      console.log(`⚠️ Speed test failed for ${testFile.url}:`, errorMessage);
      if (isCorsError) {
        console.log(
          `🚫 CORS policy blocked request to ${testFile.url} - trying next test file`
        );
      }
      // Continue to next test file
    }
  }

  // If all test files failed, try a simple estimation based on browser capabilities
  console.log(
    "🔄 All test files failed, attempting browser-based estimation..."
  );

  try {
    // Use a very small, reliable CORS-enabled resource for minimal speed test
    const testUrl = "https://httpbin.org/json"; // Small JSON response with CORS
    const startTime = performance.now();

    const response = await fetch(testUrl, { cache: "no-store" });
    if (response.ok) {
      await response.json();
      const endTime = performance.now();
      const timeMs = endTime - startTime;

      // Estimate based on response time to a known fast endpoint
      let estimatedSpeed = 10; // Default 10 Mbps
      if (timeMs < 100) estimatedSpeed = 50; // Very fast
      else if (timeMs < 200) estimatedSpeed = 25; // Fast
      else if (timeMs < 500) estimatedSpeed = 10; // Moderate
      else if (timeMs < 1000) estimatedSpeed = 5; // Slow
      else estimatedSpeed = 1; // Very slow

      console.log(
        `📊 Browser estimation: ${timeMs}ms response → ~${estimatedSpeed} Mbps`
      );

      return {
        speed: estimatedSpeed,
        confidence: "low" as const,
      };
    }
  } catch (error) {
    console.log("⚠️ Browser estimation also failed:", error);
  }

  // Final fallback - throw error
  throw new Error("All network speed detection methods failed");
}

export function getDownloadEstimate(
  fileSizeGB: number,
  speedMbps: number
): {
  timeMinutes: number;
  timeFormatted: string;
  recommendation: "good" | "acceptable" | "slow" | "very_slow";
} {
  // Convert GB to MB (using decimal: 1 GB = 1000 MB for network calculations)
  const fileSizeMB = fileSizeGB * 1000;
  // Convert Mbps (megabits per second) to MBps (megabytes per second)
  const speedMBps = speedMbps / 8;
  // Calculate time: fileSize(MB) / speed(MB/s) = time(seconds)
  const estimatedSeconds = fileSizeMB / speedMBps;
  const timeMinutes = estimatedSeconds / 60;

  // Debug logging
  console.log(`📊 Download estimate calculation:`);
  console.log(`   fileSizeGB: ${fileSizeGB} GB`);
  console.log(`   fileSizeMB: ${fileSizeMB} MB`);
  console.log(`   speedMbps: ${speedMbps} Mbps`);
  console.log(`   speedMBps: ${speedMBps.toFixed(2)} MB/s`);
  console.log(`   estimatedSeconds: ${estimatedSeconds.toFixed(1)} seconds`);
  console.log(
    `   realisticSeconds: ${estimatedSeconds.toFixed(
      1
    )} seconds (same as estimated)`
  );

  const timeSeconds = estimatedSeconds;

  let timeFormatted: string;
  if (timeMinutes < 1) {
    timeFormatted = `${Math.round(timeSeconds)}s`;
  } else if (timeMinutes < 60) {
    timeFormatted = `${Math.round(timeMinutes)}m`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = Math.round(timeMinutes % 60);
    timeFormatted = `${hours}h ${minutes}m`;
  }

  let recommendation: "good" | "acceptable" | "slow" | "very_slow";
  if (timeMinutes <= 5) {
    recommendation = "good";
  } else if (timeMinutes <= 15) {
    recommendation = "acceptable";
  } else if (timeMinutes <= 60) {
    recommendation = "slow";
  } else {
    recommendation = "very_slow";
  }

  return {
    timeMinutes,
    timeFormatted,
    recommendation,
  };
}

export async function shouldWarnUser(modelSizeGB: number = 1.8): Promise<{
  shouldWarn: boolean;
  networkInfo: NetworkInfo;
  estimate: ReturnType<typeof getDownloadEstimate>;
}> {
  const networkInfo = await detectNetworkSpeed();
  const estimate = getDownloadEstimate(modelSizeGB, networkInfo.speed);

  const shouldWarn =
    estimate.recommendation === "very_slow" ||
    estimate.recommendation === "slow" ||
    networkInfo.speed < 2;

  return {
    shouldWarn,
    networkInfo,
    estimate,
  };
}
