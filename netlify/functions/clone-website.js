const fetch = require('node-fetch');
const cheerio = require('cheerio');
const JSZip = require('jszip');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function(event, context) {
  try {
    // Parse request body
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }
    
    // Normalize URL
    const baseUrl = new URL(url);
    const hostname = baseUrl.hostname;
    const origin = baseUrl.origin;
    
    // Create assets map to avoid duplicate downloads
    const assetsMap = new Map();
    const pagesToCrawl = [url];
    const crawledPages = new Set();
    
    // Limit crawling to prevent timeouts (serverless functions have time limits)
    const maxPages = 25;
    let pageCount = 0;
    
    // Create a ZIP archive
    const zip = new JSZip();
    
    // Function to resolve URL
    const resolveUrl = (relativeUrl, baseUrl) => {
      try {
        return new URL(relativeUrl, baseUrl).toString();
      } catch (e) {
        return null;
      }
    };
    
    // Function to download and process a page
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
        
        // Process and collect assets
        
        // CSS files
        $('link[rel="stylesheet"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && !href.startsWith('http') && !href.startsWith('//')) {
            const assetUrl = resolveUrl(href, pageUrl);
            if (assetUrl) {
              assetsMap.set(href, assetUrl);
              $(el).attr('href', href.startsWith('/') ? href : `/${href}`);
            }
          }
        });
        
        // JavaScript files
        $('script[src]').each((_, el) => {
          const src = $(el).attr('src');
          if (src && !src.startsWith('http') && !src.startsWith('//')) {
            const assetUrl = resolveUrl(src, pageUrl);
            if (assetUrl) {
              assetsMap.set(src, assetUrl);
              $(el).attr('src', src.startsWith('/') ? src : `/${src}`);
            }
          }
        });
        
        // Images
        $('img[src]').each((_, el) => {
          const src = $(el).attr('src');
          if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
            const assetUrl = resolveUrl(src, pageUrl);
            if (assetUrl) {
              assetsMap.set(src, assetUrl);
              $(el).attr('src', src.startsWith('/') ? src : `/${src}`);
            }
          }
        });
        
        // Links to other pages
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            try {
              const linkUrl = new URL(href, pageUrl);
              
              // Only follow links within the same domain
              if (linkUrl.hostname === hostname && !crawledPages.has(linkUrl.toString())) {
                pagesToCrawl.push(linkUrl.toString());
              }
              
              // Update href to be relative
              if (linkUrl.hostname === hostname) {
                let relativePath = linkUrl.pathname;
                if (relativePath === '/') {
                  relativePath = '/index.html';
                }
                $(el).attr('href', relativePath);
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }
        });
        
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
          folder: 'site-to-zip',
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
    
    // Return the download URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        downloadUrl: uploadResult.secure_url,
        message: 'Website cloned successfully',
        fileSize: (zipBuffer.length / 1024 / 1024).toFixed(2) + ' MB',
        pagesCloned: pageCount,
        assetsCount: assetsMap.size,
      }),
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to clone website' }),
    };
  }
};