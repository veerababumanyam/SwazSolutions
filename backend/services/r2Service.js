const { ListObjectsV2Command, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, r2Config, getPublicUrl, isConfigured } = require('../config/r2Config');
const { Readable } = require('stream');

/**
 * Cloudflare R2 Service
 * Provides S3-compatible operations for R2 bucket
 */

/**
 * List objects in R2 bucket with optional prefix (for album scanning)
 * @param {string} prefix - Optional prefix to filter objects (e.g., "album-name/")
 * @param {number} maxKeys - Maximum number of objects to return (default: 1000)
 * @returns {Promise<Array<{key: string, size: number, lastModified: Date}>>}
 */
async function listObjects(prefix = '', maxKeys = 1000) {
    if (!isConfigured()) {
        throw new Error('R2 is not configured. Please check your environment variables.');
    }

    try {
        const objects = [];
        let continuationToken = null;

        do {
            const command = new ListObjectsV2Command({
                Bucket: r2Config.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
                ContinuationToken: continuationToken,
            });

            const response = await s3Client.send(command);

            if (response.Contents) {
                for (const object of response.Contents) {
                    objects.push({
                        key: object.Key,
                        size: object.Size,
                        lastModified: object.LastModified,
                        etag: object.ETag,
                    });
                }
            }

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        return objects;
    } catch (error) {
        console.error('Error listing R2 objects:', error);
        throw error;
    }
}

/**
 * Get public or presigned URL for an R2 object
 * @param {string} key - Object key (path in bucket)
 * @param {boolean} usePresigned - Use presigned URL (for private buckets)
 * @returns {Promise<string>} URL to access the object
 */
async function getObjectUrl(key, usePresigned = false) {
    if (!isConfigured()) {
        throw new Error('R2 is not configured. Please check your environment variables.');
    }

    if (!key) {
        throw new Error('Object key is required');
    }

    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;

    if (usePresigned) {
        // Generate presigned URL for private buckets
        const command = new GetObjectCommand({
            Bucket: r2Config.bucketName,
            Key: cleanKey,
        });

        try {
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: r2Config.presignedUrlExpiry,
            });
            return url;
        } catch (error) {
            console.error('Error generating presigned URL:', error);
            throw error;
        }
    } else {
        // Return public URL
        return getPublicUrl(cleanKey);
    }
}

/**
 * Get object as a readable stream (for metadata extraction)
 * @param {string} key - Object key (path in bucket)
 * @returns {Promise<Readable>} Stream of object data
 */
async function getObjectStream(key) {
    if (!isConfigured()) {
        throw new Error('R2 is not configured. Please check your environment variables.');
    }

    if (!key) {
        throw new Error('Object key is required');
    }

    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;

    try {
        const command = new GetObjectCommand({
            Bucket: r2Config.bucketName,
            Key: cleanKey,
        });

        const response = await s3Client.send(command);
        
        if (!response.Body) {
            throw new Error('No body in response');
        }

        // AWS SDK v3 returns response.Body as a stream-like object
        // Convert to proper Node.js Readable stream
        // response.Body is typically a ReadableStream or similar
        if (response.Body instanceof Readable) {
            return response.Body;
        } else if (typeof response.Body.transformToWebStream === 'function') {
            // Handle web streams
            const webStream = response.Body.transformToWebStream();
            return Readable.fromWeb(webStream);
        } else {
            // Fallback: convert to buffer then to stream
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            return Readable.from(Buffer.concat(chunks));
        }
    } catch (error) {
        console.error(`Error getting object stream for ${key}:`, error);
        throw error;
    }
}

/**
 * Get object metadata without downloading the file
 * @param {string} key - Object key (path in bucket)
 * @returns {Promise<{size: number, lastModified: Date, contentType: string, etag: string}>}
 */
async function headObject(key) {
    if (!isConfigured()) {
        throw new Error('R2 is not configured. Please check your environment variables.');
    }

    if (!key) {
        throw new Error('Object key is required');
    }

    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;

    try {
        const command = new HeadObjectCommand({
            Bucket: r2Config.bucketName,
            Key: cleanKey,
        });

        const response = await s3Client.send(command);

        return {
            size: response.ContentLength,
            lastModified: response.LastModified,
            contentType: response.ContentType,
            etag: response.ETag,
            metadata: response.Metadata || {},
        };
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return null;
        }
        console.error(`Error getting object head for ${key}:`, error);
        throw error;
    }
}

/**
 * Check if an object exists in R2
 * @param {string} key - Object key (path in bucket)
 * @returns {Promise<boolean>}
 */
async function objectExists(key) {
    try {
        const metadata = await headObject(key);
        return metadata !== null;
    } catch (error) {
        return false;
    }
}

/**
 * Get all objects grouped by prefix (for album scanning)
 * @param {string} prefix - Base prefix (e.g., empty string for root, or "album/" for specific album)
 * @returns {Promise<Map<string, Array>>} Map of album names to their objects
 */
async function listObjectsByAlbum(prefix = '') {
    const objects = await listObjects(prefix);
    const albumsMap = new Map();

    for (const obj of objects) {
        // Skip if it's a directory marker (ends with /)
        if (obj.key.endsWith('/')) {
            continue;
        }

        // Extract album name from path
        // Format: "album-name/song.mp3" or "swazmusic/album-name/song.mp3"
        const parts = obj.key.split('/').filter(p => p);
        
        // Remove bucket name if present in path
        const bucketNameIndex = parts.indexOf(r2Config.bucketName);
        if (bucketNameIndex !== -1) {
            parts.splice(bucketNameIndex, 1);
        }

        let albumName = 'Singles';
        let fileName = obj.key;

        if (parts.length > 1) {
            // Has album folder
            albumName = parts[parts.length - 2];
            fileName = parts[parts.length - 1];
        } else if (parts.length === 1) {
            // Root level file
            fileName = parts[0];
        }

        if (!albumsMap.has(albumName)) {
            albumsMap.set(albumName, []);
        }

        albumsMap.get(albumName).push({
            ...obj,
            fileName,
            albumName,
        });
    }

    return albumsMap;
}

module.exports = {
    listObjects,
    getObjectUrl,
    getObjectStream,
    headObject,
    objectExists,
    listObjectsByAlbum,
    isConfigured,
};
