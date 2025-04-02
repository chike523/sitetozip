// scheduled to run at 3:00 AM UTC every day
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function(event, context) {
  try {
    console.log('Starting Cloudinary cleanup process...');
    
    // Calculate date 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // UNIX timestamp for 24 hours ago
    const timestampYesterday = Math.floor(yesterday.getTime() / 1000);
    
    let cleanupStats = {
      web: { checked: 0, deleted: 0 },
      telegram: { checked: 0, deleted: 0 },
      total: { checked: 0, deleted: 0 }
    };
    
    // Function to process a folder
    async function cleanupFolder(folder, statsKey) {
      console.log(`Processing folder: ${folder}`);
      
      try {
        // List all resources in the folder
        // Note: We'll need to handle pagination if there are more than 500 resources
        const result = await cloudinary.api.resources({
          type: 'upload',
          resource_type: 'raw',
          prefix: folder,
          max_results: 500
        });
        
        console.log(`Found ${result.resources.length} resources in ${folder}`);
        cleanupStats[statsKey].checked = result.resources.length;
        cleanupStats.total.checked += result.resources.length;
        
        // Process each resource
        const deletePromises = [];
        
        for (const resource of result.resources) {
          // Extract the creation timestamp from the public_id or created_at
          const createdAt = resource.created_at ? new Date(resource.created_at) : null;
          
          if (createdAt && (createdAt.getTime() / 1000) < timestampYesterday) {
            console.log(`Deleting old resource: ${resource.public_id}, created: ${createdAt.toISOString()}`);
            
            deletePromises.push(
              cloudinary.uploader.destroy(resource.public_id, { resource_type: 'raw' })
                .then(result => {
                  console.log(`Deleted ${resource.public_id}: ${JSON.stringify(result)}`);
                  cleanupStats[statsKey].deleted++;
                  cleanupStats.total.deleted++;
                  return result;
                })
                .catch(error => {
                  console.error(`Error deleting ${resource.public_id}:`, error);
                  return null;
                })
            );
          } else {
            console.log(`Keeping resource: ${resource.public_id}, created: ${createdAt ? createdAt.toISOString() : 'unknown'}`);
          }
        }
        
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
        
        console.log(`Cleanup completed for ${folder}: ${cleanupStats[statsKey].deleted} resources deleted`);
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
      }
    }
    
    // Process both folders
    await cleanupFolder('site-to-zip/', 'web');
    await cleanupFolder('site-to-zip-telegram/', 'telegram');
    
    console.log('Cloudinary cleanup completed', cleanupStats);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cloudinary cleanup completed successfully',
        stats: cleanupStats
      })
    };
  } catch (error) {
    console.error('Error during Cloudinary cleanup:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to clean up Cloudinary resources' })
    };
  }
};