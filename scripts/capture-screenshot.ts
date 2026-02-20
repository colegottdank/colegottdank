import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

async function captureScreenshot() {
  // Check if server is already running
  const serverRunning = await isServerRunning();
  let serverProcess: any = null;
  
  if (!serverRunning) {
    console.log('Starting dev server...');
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore'
    });
    serverProcess.unref();
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    console.log('Server already running on localhost:3000');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the site
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });
    
    // Wait for the TikTok UI to load
    await page.waitForSelector('[class*="rounded-"][class*="45px"]', { timeout: 10000 });
    
    // Take full page screenshot
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotsDir, `tiktok-ui-${timestamp}.png`);
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Also capture just the TikTok phone frame
    const phoneFrame = await page.locator('[class*="rounded-"][class*="45px"]').first();
    if (await phoneFrame.isVisible()) {
      const phoneScreenshotPath = path.join(screenshotsDir, `tiktok-phone-${timestamp}.png`);
      await phoneFrame.screenshot({ path: phoneScreenshotPath });
      console.log(`Phone screenshot saved to: ${phoneScreenshotPath}`);
    }
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
    // Kill the dev server only if we started it
    if (serverProcess) {
      try {
        spawn('pkill', ['-f', 'next dev'], { stdio: 'ignore' });
      } catch (e) {
        // Ignore error if process not found
      }
    }
  }
}

captureScreenshot();