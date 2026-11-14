package org.send2all.host

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import java.io.InputStream
import java.io.OutputStream

data class AndroidFileNode(
    val name: String,
    val path: String,
    val isDir: Boolean,
    val sizeBytes: Long,
    val modifiedAt: Long,
    val children: List<AndroidFileNode>?
)

/**
 * Quản lý tệp tin trên Android qua Storage Access Framework (SAF)
 */
class StorageAccessService(private val context: Context) {

    /**
     * Quét thư mục gốc Documents của ứng dụng
     */
    fun scanInternalDocuments(): AndroidFileNode {
        val rootDir = context.getExternalFilesDir(null) ?: context.filesDir
        return scanFileRecursively(rootDir, rootDir.absolutePath)
    }

    private fun scanFileRecursively(file: java.io.File, rootPath: String): AndroidFileNode {
        val relPath = file.absolutePath.removePrefix(rootPath).ifEmpty { "/" }
        val children = if (file.isDirectory) {
            file.listFiles()?.map { scanFileRecursively(it, rootPath) }
        } else {
            null
        }

        return AndroidFileNode(
            name = file.name,
            path = relPath,
            isDir = file.isDirectory,
            sizeBytes = if (file.isDirectory) 0 else file.length(),
            modifiedAt = file.lastModified(),
            children = children
        )
    }

    /**
     * Lưu tệp tải lên từ Desktop vào thư mục đích trên Android
     */
    fun saveStreamToDisk(filename: String, input: InputStream): Long {
        val targetDir = context.getExternalFilesDir(null) ?: context.filesDir
        val targetFile = java.io.File(targetDir, filename)
        
        targetFile.outputStream().use { output ->
            val buffer = ByteArray(1024 * 512) // 512 KB buffer
            var bytesCopied = 0L
            var read: Int
            while (input.read(buffer).also { read = it } >= 0) {
                output.write(buffer, 0, read)
                bytesCopied += read
            }
            return bytesCopied
        }
    }
}
