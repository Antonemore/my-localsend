package org.send2all.host

import android.content.ContentUris
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Size
import java.io.ByteArrayOutputStream
import java.io.InputStream

data class AndroidMediaItem(
    val id: String,
    val filename: String,
    val mediaType: String, // "image" | "video"
    val creationDate: Long,
    val width: Int,
    val height: Int,
    val durationSeconds: Double?,
    val sizeBytes: Long
)

/**
 * Dịch vụ truy xuất thư viện Ảnh & Video trên Android thông qua MediaStore API
 */
class MediaStoreService(private val context: Context) {

    /**
     * Lấy danh sách ảnh và video có phân trang (Pagination)
     */
    fun fetchMedia(offset: Int, limit: Int): List<AndroidMediaItem> {
        val mediaList = mutableListOf<AndroidMediaItem>()
        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            MediaStore.Files.getContentUri("external")
        }

        val projection = arrayOf(
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.MEDIA_TYPE,
            MediaStore.Files.FileColumns.DATE_ADDED,
            MediaStore.Files.FileColumns.WIDTH,
            MediaStore.Files.FileColumns.HEIGHT,
            MediaStore.Files.FileColumns.DURATION,
            MediaStore.Files.FileColumns.SIZE
        )

        val selection = "${MediaStore.Files.FileColumns.MEDIA_TYPE}=? OR ${MediaStore.Files.FileColumns.MEDIA_TYPE}=?"
        val selectionArgs = arrayOf(
            MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE.toString(),
            MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO.toString()
        )
        val sortOrder = "${MediaStore.Files.FileColumns.DATE_ADDED} DESC"

        val cursor = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val queryArgs = Bundle().apply {
                putInt(android.content.ContentResolver.QUERY_ARG_OFFSET, offset)
                putInt(android.content.ContentResolver.QUERY_ARG_LIMIT, limit)
                putString(android.content.ContentResolver.QUERY_ARG_SQL_SELECTION, selection)
                putStringArray(android.content.ContentResolver.QUERY_ARG_SQL_SELECTION_ARGS, selectionArgs)
                putStringArray(android.content.ContentResolver.QUERY_ARG_SORT_COLUMNS, arrayOf(MediaStore.Files.FileColumns.DATE_ADDED))
                putInt(android.content.ContentResolver.QUERY_ARG_SORT_DIRECTION, android.content.ContentResolver.QUERY_SORT_DIRECTION_DESCENDING)
            }
            context.contentResolver.query(collection, projection, queryArgs, null)
        } else {
            context.contentResolver.query(collection, projection, selection, selectionArgs, "$sortOrder LIMIT $limit OFFSET $offset")
        }

        cursor?.use {
            val idCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID)
            val nameCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
            val typeCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MEDIA_TYPE)
            val dateCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DATE_ADDED)
            val widthCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.WIDTH)
            val heightCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.HEIGHT)
            val durCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DURATION)
            val sizeCol = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.SIZE)

            while (it.moveToNext()) {
                val id = it.getLong(idCol)
                val name = it.getString(nameCol) ?: "media_$id"
                val mediaType = if (it.getInt(typeCol) == MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO) "video" else "image"
                val date = it.getLong(dateCol) * 1000
                val width = it.getInt(widthCol)
                val height = it.getInt(heightCol)
                val durationMs = if (mediaType == "video") it.getLong(durCol) else null
                val size = it.getLong(sizeCol)

                mediaList.add(
                    AndroidMediaItem(
                        id = id.toString(),
                        filename = name,
                        mediaType = mediaType,
                        creationDate = date,
                        width = width,
                        height = height,
                        durationSeconds = durationMs?.let { d -> d / 1000.0 },
                        sizeBytes = size
                    )
                )
            }
        }

        return mediaList
    }

    /**
     * Tạo thumbnail 200x200 siêu nhanh bằng phần cứng Android 10+
     */
    fun loadThumbnailBytes(mediaId: String, isVideo: Boolean): ByteArray? {
        val uri = if (isVideo) {
            ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, mediaId.toLong())
        } else {
            ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, mediaId.toLong())
        }

        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val bitmap = context.contentResolver.loadThumbnail(uri, Size(200, 200), null)
                val stream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 75, stream)
                stream.toByteArray()
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Mở InputStream đọc file gốc để stream qua socket Rust
     */
    fun openMediaInputStream(mediaId: String, isVideo: Boolean): InputStream? {
        val uri = if (isVideo) {
            ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, mediaId.toLong())
        } else {
            ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, mediaId.toLong())
        }
        return context.contentResolver.openInputStream(uri)
    }
}
