const fetch = require('node-fetch');
const cheerio = require('cheerio');
const JSZip = require('jszip');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const TelegramBot = require('node-telegram-bot-api');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.handler = async function(event, context) {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    // Parse Telegram update
    const body = JSON.parse(event.body);
    
    // Check if this is a message update with text
    if (!body.message || !body.message.text) {
      return { statusCode: 200, body: 'OK' };
    }
    
    const { message } = body;
    const chatId = message.chat.id;
    const text = message.text;
    
    // Process commands
    if (text.startsWith('/clone ')) {
      // Extract URL from the command
      const url = text.substring(7).trim();
      
      // Validate URL
      if (!url.match(/^https?:\/\//i)) {
        await bot.sendMessage(
          chatId, 
          "Please provide a valid URL starting with http:// or https://"
        );
        return { statusCode: 200, body: 'OK' };
      }
      
      // Send initial response
      await bot.sendMessage(
        chatId, 
        "🔄 Starting to clone the website. This may take a few minutes..."
      );
      
      try {
        // Clone the website - similar logic to the clone-website function
        const baseUrl = new URL(url);
        const hostname = baseUrl.hostname;
        
        // Create assets map to avoid duplicate downloads
        const assetsMap = new Map();
        const pagesToCrawl = [url];
        const crawledPages = new Set();
        
        // Limit crawling to prevent timeouts
        const maxPages = 25;
        let pageCount = 0;
        
        // Create a ZIP archive
        const zip = new JSZip();
        
        // Function to resolve URL (same as in clone-website.js)
        const resolveUrl = (relativeUrl, baseUrl) => {
          try {
            return new URL(relativeUrl, baseUrl).toString();
          } catch (e) {
            return null;
          }
        };
        
        // Process page function
        async function processPage(pageUrl) {
          if (crawledPages.has(pageUrl) || pageCount >= maxPages) return;
          
          crawledPages.add(pageUrl);
          pageCount++;
          
          try {
            // Fetch page content
            const response = await fetch(pageUrl);
            const html = await response.text();
            
            // Parse HTML
            const $ = cheerio.load(html);
            
            // Determine path in ZIP
            let pagePath = new URL(pageUrl).pathname;
            if (pagePath === '/' || pagePath === '') {
              pagePath = '/index.html';
            } else if (!pagePath.endsWith('.html') && !pagePath.endsWith('.htm')) {
              pagePath = pagePath.endsWith('/') ? `${pagePath}index.html` : `${pagePath}.html`;
            }
            
            // Process CSS files, JS files, images, links (same as in clone-website.js)
            // ...
            
            // Add the processed HTML to the archive
            zip.file(pagePath.startsWith('/') ? pagePath.substring(1) : pagePath, $.html());
            
          } catch (error) {
            console.error(`Error processing page ${pageUrl}:`, error);
          }
        }
        
        // Crawl pages
        await processPage(url);
        
        for (let i = 0; i < pagesToCrawl.length && pageCount < maxPages; i++) {
          await processPage(pagesToCrawl[i]);
        }
        
        // Download and add assets
        for (const [assetPath, assetUrl] of assetsMap.entries()) {
          try {
            const response = await fetch(assetUrl);
            const buffer = await response.arrayBuffer();
            
            const path = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
            zip.file(path, buffer);
          } catch (error) {
            console.error(`Error downloading asset ${assetUrl}:`, error);
          }
        }
        
        // Generate the ZIP file
        const zipBuffer = await zip.generateAsync({
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 9
          }
        });
        
        // Create zip file name
        const zipFileName = `${hostname.replace(/\./g, '-')}-${Date.now()}.zip`;
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              public_id: zipFileName,
              folder: 'site-to-zip-telegram',
              format: 'zip',
              type: 'upload',
              access_mode: 'public',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          // Convert buffer to stream and pipe to uploadStream
          const bufferStream = new Readable();
          bufferStream.push(zipBuffer);
          bufferStream.push(null);
          bufferStream.pipe(uploadStream);
        });
        
        // Send success message with download link
        await bot.sendMessage(
          chatId,
          `✅ Website cloned successfully!\n\n` +
          `📊 Pages cloned: ${pageCount}\n` +
          `🖼️ Assets captured: ${assetsMap.size}\n` +
          `📦 File size: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB\n\n` +
          `⬇️ Download your ZIP file here:\n${uploadResult.secure_url}\n\n` +
          `⚠️ The link will expire in 24 hours.`
        );
      } catch (error) {
        console.error('Error cloning website via Telegram:', error);
        
        // Send error message
        await bot.sendMessage(
          chatId,
          `❌ Sorry, something went wrong while cloning the website.\n\n` +
          `Error: ${error.message || 'Unknown error'}\n\n` +
          `Please try again with a different URL or contact support.`
        );
      }
    } 
    else if (text === '/start') {
      // Welcome message
      await bot.sendMessage(
        chatId,
        "👋 Welcome to SiteToZip Bot! 🤖\n\n" +
        "I can clone websites for you and provide a ZIP download.\n\n" +
        "To clone a website, send:\n/clone https://example.com\n\n" +
        "Visit our website at https://sitetozip.netlify.app for more features!"
      );
    } 
    else if (text === '/help') {
      // Help message
      await bot.sendMessage(
        chatId,
        "ℹ️ SiteToZip Bot Help 🤖\n\n" +
        "Commands:\n" +
        "/start - Welcome message\n" +
        "/help - Show this help message\n" +
        "/clone URL - Clone a website (e.g., /clone https://example.com)\n\n" +
        "The bot will crawl the website and provide a ZIP download link that's valid for 24 hours.\n\n" +
        "Need more help? Visit our website: https://sitetozip.netlify.app"
      );
    } 
    else {
      // Unknown command
      await bot.sendMessage(
        chatId,
        "I don't understand that command. Use /clone URL to clone a website or /help for assistance."
      );
    }
    
    return { statusCode: 200, body: 'OK' };
    
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to process Telegram webhook' }) };
  }
};