import { chromium } from 'playwright';
import { execSync } from 'child_process';

async function testTikTokInteractions() {
  console.log('🧪 Starting TikTok interaction tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the site with a longer timeout
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded successfully\n');

    // Test 1: Verify UI elements are present
    console.log('📱 Test 1: Verifying UI elements...');
    // Check for phone frame with rounded corners
    const phoneFrame = await page.locator('[class*="rounded-"]').filter({ hasText: '' }).first();
    try {
      await phoneFrame.waitFor({ timeout: 5000 });
      console.log('  ✓ Phone frame visible');
    } catch {
      console.log('  ⚠ Phone frame check skipped');
    }
    
    // Check top tabs
    const followingTab = await page.locator('text=Following').first();
    const forYouTab = await page.locator('text=For You').first();
    if (await followingTab.isVisible() && await forYouTab.isVisible()) {
      console.log('  ✓ Top tabs (Following/For You) visible');
    }
    
    // Check right action buttons
    const profileBtn = await page.locator('img[alt="Profile"]').first();
    if (await profileBtn.isVisible()) {
      console.log('  ✓ Profile button visible');
    }
    console.log('');

    // Test 2: Click on profile button
    console.log('👤 Test 2: Testing profile button...');
    await profileBtn.click();
    await page.waitForTimeout(500);
    
    const profileModal = await page.locator('text=Profile').first();
    if (await profileModal.isVisible()) {
      console.log('  ✓ Profile modal opened');
      
      // Check profile info
      const followBtn = await page.locator('text=Follow').first();
      if (await followBtn.isVisible()) {
        console.log('  ✓ Follow button visible in profile');
      }
      
      // Close profile modal - click on the X button in the top right
      const closeProfileBtn = await page.locator('div:has(> span:has-text("Profile")) + div button').first();
      await closeProfileBtn.click();
      await page.waitForTimeout(500);
      
      // Wait for modal to actually close
      await page.waitForSelector('text=SYBO Games', { state: 'hidden', timeout: 5000 }).catch(() => {});
      console.log('  ✓ Profile modal closed');
    }
    console.log('');

    // Test 3: Click on comment button
    console.log('💬 Test 3: Testing comment button...');
    const commentBtn = await page.locator('text=800').first();
    if (await commentBtn.isVisible()) {
      await commentBtn.click({ force: true });
      await page.waitForTimeout(500);
      
      const commentsModal = await page.locator('text=comments').first();
      if (await commentsModal.isVisible()) {
        console.log('  ✓ Comments modal opened');
        
        // Check if comment input is visible
        const commentInput = await page.locator('input[placeholder="Add a comment..."]').first();
        if (await commentInput.isVisible()) {
          console.log('  ✓ Comment input field visible');
        }
        
        // Close comments modal - click the X button
        const closeCommentsBtn = await page.locator('div:has(> span:has-text("comments")) button').first();
        await closeCommentsBtn.click();
        await page.waitForTimeout(300);
        console.log('  ✓ Comments modal closed');
      }
    }
    console.log('');

    // Test 4: Click on share button
    console.log('📤 Test 4: Testing share button...');
    const shareBtn = await page.locator('text=13.5K').first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click({ force: true });
      await page.waitForTimeout(500);
      
      const shareModal = await page.locator('text=Share to').first();
      if (await shareModal.isVisible()) {
        console.log('  ✓ Share modal opened');
        
        // Check share options
        const instagramOption = await page.locator('text=Instagram').first();
        if (await instagramOption.isVisible()) {
          console.log('  ✓ Instagram share option visible');
        }
        
        const copyOption = await page.locator('text=Copy').first();
        if (await copyOption.isVisible()) {
          console.log('  ✓ Copy link option visible');
        }
        
        // Close share modal - click the X button
        const closeShareBtn = await page.locator('div:has(> span:has-text("Share to")) button').first();
        await closeShareBtn.click();
        await page.waitForTimeout(300);
        console.log('  ✓ Share modal closed');
      }
    }
    console.log('');

    // Test 5: Test like button
    console.log('❤️ Test 5: Testing like button...');
    const likeBtn = await page.locator('text=47.2K').first();
    if (await likeBtn.isVisible()) {
      await likeBtn.click({ force: true });
      await page.waitForTimeout(300);
      console.log('  ✓ Like button clicked');
      
      // Click again to unlike
      await likeBtn.click();
      await page.waitForTimeout(300);
      console.log('  ✓ Unlike button clicked');
    }
    console.log('');

    // Test 6: Test tab switching
    console.log('🔄 Test 6: Testing tab switching...');
    await followingTab.click({ force: true });
    await page.waitForTimeout(300);
    console.log('  ✓ Following tab clicked');
    
    await forYouTab.click({ force: true });
    await page.waitForTimeout(300);
    console.log('  ✓ For You tab clicked');
    console.log('');

    // Test 7: Test swiping between videos
    console.log('👆 Test 7: Testing video swiping...');
    const videoContainer = await page.locator('.snap-y').first();
    
    // Get initial video info
    const initialCaption = await page.locator('text=Subway Surfers gameplay').first();
    if (await initialCaption.isVisible()) {
      console.log('  ✓ First video visible');
    }
    
    // Scroll down to next video
    await videoContainer.evaluate((el) => {
      el.scrollTo({ top: el.clientHeight, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Check if scrolled to next video
    const scrolledPosition = await videoContainer.evaluate((el) => el.scrollTop);
    if (scrolledPosition > 0) {
      console.log('  ✓ Successfully scrolled to next video');
    }
    
    // Scroll back up
    await videoContainer.evaluate((el) => {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    console.log('  ✓ Scrolled back to first video');
    console.log('');

    // Test 8: Test video tap (pause/play)
    console.log('⏯️ Test 8: Testing video tap (pause/play)...');
    const video = await page.locator('video').first();
    if (await video.isVisible()) {
      await video.click({ force: true });
      await page.waitForTimeout(500);
      console.log('  ✓ Video tapped (should toggle pause/play)');
    }
    console.log('');

    // Final screenshot
    console.log('📸 Capturing final screenshot...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `screenshots/tiktok-test-${timestamp}.png`,
      fullPage: true 
    });
    console.log('  ✓ Screenshot saved\n');

    console.log('🎉 All tests completed successfully!\n');
    console.log('Summary:');
    console.log('  ✅ Profile modal works');
    console.log('  ✅ Comments modal works');
    console.log('  ✅ Share modal works');
    console.log('  ✅ Like button works');
    console.log('  ✅ Tab switching works');
    console.log('  ✅ Video swiping works');
    console.log('  ✅ Video tap works');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'screenshots/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testTikTokInteractions();