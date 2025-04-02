const fetch = require('node-fetch');
const cheerio = require('cheerio');
const JSZip = require('jszip');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const url = require('url');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function(event, context) {
  try {
    // Parse request body
    const { url: websiteUrl } = JSON.parse(event.body);
    
    if (!websiteUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }
    
    console.log('Starting to clone website:', websiteUrl);
    
    // Normalize URL
    let baseUrl;
    try {
      baseUrl = new URL(websiteUrl);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }
    
    const hostname = baseUrl.hostname;
    const origin = baseUrl.origin;
    
    console.log('Hostname:', hostname, 'Origin:', origin);
    
    // Create assets map to avoid duplicate downloads
    const assetsMap = new Map();
    const pagesToCrawl = [websiteUrl];
    const crawledPages = new Set();
    
    // Limit crawling to prevent timeouts (serverless functions have time limits)
    const maxPages = 15; // Reduced to avoid timeouts
    let pageCount = 0;
    
    // Create a ZIP archive
    const zip = new JSZip();
    
    // Add README file to the ZIP
    zip.file('README.txt', 
      `Website Clone of ${websiteUrl}\n` +
      `Created with SiteToZip on ${new Date().toLocaleString()}\n\n` +
      `To view this website:\n` +
      `1. Extract all files preserving folder structure\n` +
      `2. Open 'index.html' in your web browser\n\n` +
      `Note: Some features requiring server-side functionality may not work offline.`
    );
    
    // Function to resolve URL
    const resolveUrl = (relativeUrl, baseUrl) => {
      try {
        // Handle data URLs
        if (relativeUrl.startsWith('data:')) {
          return relativeUrl;
        }
        
        // Handle absolute URLs
        if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
          return relativeUrl;
        }
        
        // Handle protocol-relative URLs
        if (relativeUrl.startsWith('//')) {
          return baseUrl.protocol + relativeUrl;
        }
        
        // Handle root-relative URLs
        if (relativeUrl.startsWith('/')) {
          return `${baseUrl.origin}${relativeUrl}`;
        }
        
        // Handle relative URLs
        return new URL(relativeUrl, baseUrl).toString();
      } catch (e) {
        console.error('Failed to resolve URL:', relativeUrl, baseUrl, e);
        return null;
      }
    };
    
    // Function to determine file path in ZIP
    const getZipPath = (urlString) => {
      try {
        const parsedUrl = new URL(urlString);
        let filePath = parsedUrl.pathname;
        
        // Remove query parameters and hash
        filePath = filePath.split('?')[0].split('#')[0];
        
        // Handle root path
        if (filePath === '/' || filePath === '') {
          return 'index.html';
        }
        
        // Add index.html to directory paths
        if (filePath.endsWith('/')) {
          filePath += 'index.html';
        }
        
        // Remove leading slash if present
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }
        
        // Handle paths without extensions for HTML files
        if (!filePath.includes('.')) {
          filePath += '.html';
        }
        
        return filePath;
      } catch (e) {
        console.error('Error determining ZIP path:', e);
        return null;
      }
    };
    
    // Function to download and process a page
    async function processPage(pageUrl) {
      if (crawledPages.has(pageUrl) || pageCount >= maxPages) return;
      
      console.log(`Processing page ${pageCount + 1}/${maxPages}: ${pageUrl}`);
      crawledPages.add(pageUrl);
      pageCount++;
      
      try {
        // Fetch page content with proper headers
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SiteToZipBot/1.0;)',
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
          timeout: 8000, // 8 second timeout
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch ${pageUrl}: ${response.status} ${response.statusText}`);
          return;
        }
        
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          console.log(`Skipping non-HTML content at ${pageUrl}: ${contentType}`);
          return;
        }
        
        const html = await response.text();
        console.log(`Downloaded page: ${pageUrl} (${html.length} bytes)`);
        
        if (html.length === 0) {
          console.error(`Empty HTML received for ${pageUrl}`);
          return;
        }
        
        // Parse HTML
        const $ = cheerio.load(html);
        
        // Check for base tag
        const baseTagHref = $('base[href]').attr('href');
        const pageBaseUrl = baseTagHref ? new URL(baseTagHref, pageUrl).toString() : pageUrl;
        
        // Determine path in ZIP
        const pagePath = getZipPath(pageUrl);
        if (!pagePath) {
          console.error(`Could not determine path for ${pageUrl}`);
          return;
        }
        
        console.log(`Will save page to: ${pagePath}`);
        
        // Process and collect assets
        
        // CSS files
        $('link[rel="stylesheet"], link[type="text/css"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && !href.startsWith('data:')) {
            try {
              const absoluteUrl = resolveUrl(href, pageBaseUrl);
              if (absoluteUrl) {
                const assetPath = getZipPath(absoluteUrl);
                if (assetPath) {
                  assetsMap.set(assetPath, absoluteUrl);
                  $(el).attr('href', assetPath);
                  console.log(`Found CSS: ${absoluteUrl} -> ${assetPath}`);
                }
              }
            } catch (e) {
              console.error(`Error processing CSS ${href}:`, e);
            }
          }
        });
        
        // JavaScript files
        $('script[src]').each((_, el) => {
          const src = $(el).attr('src');
          if (src && !src.startsWith('data:')) {
            try {
              const absoluteUrl = resolveUrl(src, pageBaseUrl);
              if (absoluteUrl) {
                const assetPath = getZipPath(absoluteUrl);
                if (assetPath) {
                  assetsMap.set(assetPath, absoluteUrl);
                  $(el).attr('src', assetPath);
                  console.log(`Found JS: ${absoluteUrl} -> ${assetPath}`);
                }
              }
            } catch (e) {
              console.error(`Error processing JS ${src}:`, e);
            }
          }
        });
        
        // Images
        $('img[src]').each((_, el) => {
          const src = $(el).attr('src');
          if (src && !src.startsWith('data:')) {
            try {
              const absoluteUrl = resolveUrl(src, pageBaseUrl);
              if (absoluteUrl) {
                const assetPath = getZipPath(absoluteUrl);
                if (assetPath) {
                  assetsMap.set(assetPath, absoluteUrl);
                  $(el).attr('src', assetPath);
                  console.log(`Found image: ${absoluteUrl} -> ${assetPath}`);
                }
              }
            } catch (e) {
              console.error(`Error processing image ${src}:`, e);
            }
          }
        });
        
        // Favicon
        $('link[rel="icon"], link[rel="shortcut icon"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && !href.startsWith('data:')) {
            try {
              const absoluteUrl = resolveUrl(href, pageBaseUrl);
              if (absoluteUrl) {
                const assetPath = getZipPath(absoluteUrl);
                if (assetPath) {
                  assetsMap.set(assetPath, absoluteUrl);
                  $(el).attr('href', assetPath);
                  console.log(`Found favicon: ${absoluteUrl} -> ${assetPath}`);
                }
              }
            } catch (e) {
              console.error(`Error processing favicon ${href}:`, e);
            }
          }
        });
        
        // Links to other pages
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && !href.startsWith('#') && !href.startsWith('javascript:') && 
              !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            try {
              const absoluteUrl = resolveUrl(href, pageBaseUrl);
              if (absoluteUrl) {
                const linkUrl = new URL(absoluteUrl);
                
                // Only follow links within the same domain
                if (linkUrl.hostname === hostname && 
                    !crawledPages.has(absoluteUrl) && 
                    !pagesToCrawl.includes(absoluteUrl)) {
                  
                  pagesToCrawl.push(absoluteUrl);
                  console.log(`Queued page: ${absoluteUrl}`);
                }
                
                // Update href to be relative path
                if (linkUrl.hostname === hostname) {
                  const linkPath = getZipPath(absoluteUrl);
                  if (linkPath) {
                    $(el).attr('href', linkPath);
                  }
                }
              }
            } catch (e) {
              console.error(`Error processing link ${href}:`, e);
            }
          }
        });
        
        // Add the processed HTML to the archive
        const finalHtml = $.html();
        console.log(`Saving page ${pagePath} (${finalHtml.length} bytes)`);
        zip.file(pagePath, finalHtml);
        
      } catch (error) {
        console.error(`Error processing page ${pageUrl}:`, error);
      }
    }
    
    // Start crawling with the initial URL
    try {
      await processPage(websiteUrl);
    } catch (error) {
      console.error('Error processing initial page:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to process the initial page' }),
      };
    }
    
    // Process queued pages
    try {
      for (let i = 0; i < pagesToCrawl.length && pageCount < maxPages; i++) {
        await processPage(pagesToCrawl[i]);
      }
    } catch (error) {
      console.error('Error processing queued pages:', error);
    }
    
    console.log(`Finished crawling. Pages processed: ${pageCount}, Assets found: ${assetsMap.size}`);
    
    // Download and add assets
    try {
      let assetsProcessed = 0;
      for (const [assetPath, assetUrl] of assetsMap.entries()) {
        try {
          console.log(`Downloading asset ${assetsProcessed + 1}/${assetsMap.size}: ${assetUrl}`);
          
          const response = await fetch(assetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; SiteToZipBot/1.0;)',
              'Accept': '*/*',
            },
            redirect: 'follow',
            timeout: 5000, // 5 second timeout for assets
          });
          
          if (!response.ok) {
            console.error(`Failed to download asset ${assetUrl}: ${response.status}`);
            continue;
          }
          
          const buffer = await response.buffer();
          console.log(`Downloaded asset: ${assetUrl} (${buffer.length} bytes)`);
          
          zip.file(assetPath, buffer);
          assetsProcessed++;
        } catch (error) {
          console.error(`Error downloading asset ${assetUrl}:`, error);
        }
      }
      
      console.log(`Assets processed: ${assetsProcessed}/${assetsMap.size}`);
    } catch (error) {
      console.error('Error processing assets:', error);
    }
    
    // Generate the ZIP file
    let zipBuffer;
    try {
      console.log('Generating ZIP file...');
      zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });
      
      console.log(`ZIP generated: ${zipBuffer.length} bytes`);
      
      // Validation
      if (zipBuffer.length < 100) {
        throw new Error('Generated ZIP is too small, likely empty');
      }
    } catch (error) {
      console.error('Error generating ZIP:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate ZIP file' }),
      };
    }
    
    // Create zip file name
    const zipFileName = `${hostname.replace(/\./g, '-')}-${Date.now()}.zip`;
    
    // Upload to Cloudinary
    try {
      console.log('Uploading ZIP to Cloudinary...');
      
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
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        // Convert buffer to stream and pipe to uploadStream
        const bufferStream = new Readable();
        bufferStream.push(zipBuffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      });
      
      console.log('ZIP uploaded to Cloudinary:', uploadResult.secure_url);
      
      // Return the download URL and stats
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
      console.error('Error uploading to Cloudinary:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to upload ZIP file to storage' }),
      };
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An unexpected error occurred' }),
    };
  }
};