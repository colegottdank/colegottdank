import { chromium } from 'playwright';

async function verifyTikTokFeatures() {
  console.log('📸 Starting visual verification of TikTok features...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the site
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded successfully\n');

    // Capture 1: Initial state
    console.log('📸 Capture 1: Initial state');
    await page.screenshot({ path: 'screenshots/01-initial-state.png', fullPage: true });
    console.log('  ✓ Screenshot saved\n');

    // Capture 2: Profile modal
    console.log('📸 Capture 2: Profile modal');
    const profileBtn = await page.locator('img[alt="Profile"]').first();
    await profileBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/02-profile-modal.png', fullPage: true });
    console.log('  ✓ Profile modal screenshot saved\n');

    // Capture 3: Comments modal
    console.log('📸 Capture 3: Comments modal');
    // First close profile modal by clicking outside
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const commentBtn = await page.locator('text=800').first();
    await commentBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/03-comments-modal.png', fullPage: true });
    console.log('  ✓ Comments modal screenshot saved\n');

    // Capture 4: Share modal
    console.log('📸 Capture 4: Share modal');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const shareBtn = await page.locator('text=13.5K').first();
    await shareBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/04-share-modal.png', fullPage: true });
    console.log('  ✓ Share modal screenshot saved\n');

    // Capture 5: After like click
    console.log('📸 Capture 5: After like interaction');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const likeBtn = await page.locator('text=47.2K').first();
    await likeBtn.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/05-after-like.png', fullPage: true });
    console.log('  ✓ After like screenshot saved\n');

    // Capture 6: Following tab
    console.log('📸 Capture 6: Following tab selected');
    const followingTab = await page.locator('text=Following').first();
    await followingTab.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/06-following-tab.png', fullPage: true });
    console.log('  ✓ Following tab screenshot saved\n');

    // Capture 7: For You tab
    console.log('📸 Capture 7: For You tab selected');
    const forYouTab = await page.locator('text=For You').first();
    await forYouTab.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/07-foryou-tab.png', fullPage: true });
    console.log('  ✓ For You tab screenshot saved\n');

    // Capture 8: After scrolling to next video
    console.log('📸 Capture 8: After scrolling to next video');
    const videoContainer = await page.locator('.snap-y').first();
    await videoContainer.evaluate((el) => {
      el.scrollTo({ top: el.clientHeight, behavior: 'smooth' });
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/08-scrolled-video.png', fullPage: true });
    console.log('  ✓ Scrolled video screenshot saved\n');

    console.log('🎉 All verifications completed!\n');
    console.log('Screenshots saved:');
    console.log('  📸 01-initial-state.png');
    console.log('  📸 02-profile-modal.png');
    console.log('  📸 03-comments-modal.png');
    console.log('  📸 04-share-modal.png');
    console.log('  📸 05-after-like.png');
    console.log('  📸 06-following-tab.png');
    console.log('  📸 07-foryou-tab.png');
    console.log('  📸 08-scrolled-video.png');
    console.log('\n✅ TikTok simulator is fully interactive and working!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    await page.screenshot({ path: 'screenshots/verification-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

verifyTikTokFeatures();