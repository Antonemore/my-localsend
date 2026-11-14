import Foundation
import UIKit

public struct FileNodeItem: Codable {
    public let name: String
    public let path: String
    public let isDir: Bool
    public let sizeBytes: UInt64
    public let modifiedAt: Date
    public let children: [FileNodeItem]?
}

/// Dịch vụ quản lý Filesystem của iOS: Documents App Sandbox + Thư mục ngoài (Security-Scoped)
public final class FileStorageService {
    public static let shared = FileStorageService()
    
    private let fileManager = FileManager.default
    private var accessibleFolders: [URL] = []
    
    private init() {
        loadPersistedBookmarks()
    }
    
    /// Thư mục Documents mặc định trong Sandbox của ứng dụng
    public var defaultDocumentsDirectory: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    /// Đăng ký thư mục ngoài do người dùng chọn từ UIDocumentPickerViewController
    public func registerExternalFolder(url: URL) -> Bool {
        guard url.startAccessingSecurityScopedResource() else { return false }
        
        do {
            let bookmark = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
            var bookmarks = UserDefaults.standard.array(forKey: "SecurityScopedBookmarks") as? [Data] ?? []
            bookmarks.append(bookmark)
            UserDefaults.standard.set(bookmarks, forKey: "SecurityScopedBookmarks")
            
            accessibleFolders.append(url)
            return true
        } catch {
            print("Lỗi lưu Security-Scoped Bookmark: \(error)")
            url.stopAccessingSecurityScopedResource()
            return false
        }
    }
    
    private func loadPersistedBookmarks() {
        guard let bookmarks = UserDefaults.standard.array(forKey: "SecurityScopedBookmarks") as? [Data] else { return }
        for data in bookmarks {
            var isStale = false
            if let url = try? URL(resolvingBookmarkData: data, options: .withoutUI, relativeTo: nil, bookmarkDataIsStale: &isStale),
               url.startAccessingSecurityScopedResource() {
                accessibleFolders.append(url)
            }
        }
    }
    
    /// Quét cây thư mục phục vụ API /api/v1/files/tree
    public func getFileTree(relativePath: String = "") -> FileNodeItem {
        let targetUrl = defaultDocumentsDirectory.appendingPathComponent(relativePath)
        return scanNode(at: targetUrl, rootUrl: defaultDocumentsDirectory)
    }
    
    private func scanNode(at url: URL, rootUrl: URL) -> FileNodeItem {
        let isDirectory = (try? url.resourceValues(forKeys: [.isDirectoryKey]))?.isDirectory ?? false
        let size = (try? url.resourceValues(forKeys: [.fileSizeKey]))?.fileSize ?? 0
        let modified = (try? url.resourceValues(forKeys: [.contentModificationDateKey]))?.contentModificationDate ?? Date()
        let relPath = url.path.replacingOccurrences(of: rootUrl.path, with: "")
        
        var childrenNodes: [FileNodeItem]? = nil
        if isDirectory {
            if let contents = try? fileManager.contentsOfDirectory(at: url, includingPropertiesForKeys: [.isDirectoryKey, .fileSizeKey, .contentModificationDateKey], options: .skipsHiddenFiles) {
                childrenNodes = contents.map { scanNode(at: $0, rootUrl: rootUrl) }
            }
        }
        
        return FileNodeItem(
            name: url.lastPathComponent,
            path: relPath.isEmpty ? "/" : relPath,
            isDir: isDirectory,
            sizeBytes: UInt64(size),
            modifiedAt: modified,
            children: childrenNodes
        )
    }
    
    /// Đọc dữ liệu tệp hỗ trợ Range (Bytes Start - End)
    public func readFileData(relativePath: String, offset: UInt64 = 0, length: UInt64? = nil) throws -> Data {
        let fileUrl = defaultDocumentsDirectory.appendingPathComponent(relativePath)
        let fileHandle = try FileHandle(forReadingFrom: fileUrl)
        defer { try? fileHandle.close() }
        
        try fileHandle.seek(toOffset: offset)
        if let length = length {
            return fileHandle.readData(ofLength: Int(length))
        } else {
            return fileHandle.readDataToEndOfFile()
        }
    }
    
    /// Lưu tệp tải lên từ Desktop vào thư mục đích
    public func saveIncomingFile(filename: String, relativeDirectory: String = "", dataStream: InputStream) throws -> URL {
        let destDir = defaultDocumentsDirectory.appendingPathComponent(relativeDirectory)
        try fileManager.createDirectory(at: destDir, withIntermediateDirectories: true)
        
        let destinationUrl = destDir.appendingPathComponent(filename)
        if fileManager.fileExists(atPath: destinationUrl.path) {
            try fileManager.removeItem(at: destinationUrl)
        }
        
        guard let outputStream = OutputStream(url: destinationUrl, append: false) else {
            throw NSError(domain: "FileStorageService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Failed to open output stream"])
        }
        
        outputStream.open()
        dataStream.open()
        defer {
            outputStream.close()
            dataStream.close()
        }
        
        var buffer = [UInt8](repeating: 0, count: 1024 * 512) // 512KB buffer
        while dataStream.hasBytesAvailable {
            let bytesRead = dataStream.read(&buffer, maxLength: buffer.count)
            if bytesRead > 0 {
                outputStream.write(buffer, maxLength: bytesRead)
            } else {
                break
            }
        }
        
        return destinationUrl
    }
}
