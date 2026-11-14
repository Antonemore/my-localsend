import Foundation
import Photos
import UIKit
import AVFoundation

/// Cấu trúc đại diện cho một mục Photo/Video từ PhotoKit truyền sang Rust/Web
public struct PhotoMetadata: Codable, Identifiable {
    public let id: String
    public let filename: String
    public let mediaType: String // "image" | "video"
    public let creationDate: Date?
    public let pixelWidth: Int
    public let pixelHeight: Int
    public let durationSeconds: Double?
    public let isFavorite: Bool
    public let isLivePhoto: Bool
    public let chatSource: String? // "Zalo", "Telegram", "WhatsApp", nil = "Camera Roll"
}

/// Dịch vụ quản lý truy xuất và chuyển đổi ảnh/video qua PhotoKit
public final class PhotoKitService: NSObject {
    public static let shared = PhotoKitService()
    
    private let imageManager = PHCachingImageManager.default()
    
    private override init() {
        super.init()
    }
    
    /// Yêu cầu và kiểm tra quyền truy cập thư viện ảnh
    public func requestAuthorization() async -> PHAuthorizationStatus {
        if #available(iOS 14, *) {
            return await PHPhotoLibrary.requestAuthorization(for: .readWrite)
        } else {
            return await withCheckedContinuation { continuation in
                PHPhotoLibrary.requestAuthorization { status in
                    continuation.resume(returning: status)
                }
            }
        }
    }
    
    /// Mở Cài đặt hệ thống iOS để người dùng thay đổi quyền cấp phép
    @MainActor
    public func openSystemSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString),
              UIApplication.shared.canOpenURL(url) else { return }
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }
    
    /// Lấy danh sách ảnh/video có phân trang, phát hiện Live Photo và nhận diện Album Zalo/Telegram
    public func fetchAssets(offset: Int, limit: Int, albumName: String? = nil) -> [PhotoMetadata] {
        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        options.includeAssetSourceTypes = [.typeUserLibrary, .typeCloudShared, .typeiTunesSynced]
        
        let allAssets: PHFetchResult<PHAsset>
        if let albumName = albumName {
            let collections = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .any, options: nil)
            var targetCollection: PHAssetCollection?
            collections.enumerateObjects { collection, _, stop in
                if collection.localizedTitle?.localizedCaseInsensitiveContains(albumName) == true {
                    targetCollection = collection
                    stop.pointee = true
                }
            }
            if let col = targetCollection {
                allAssets = PHAsset.fetchAssets(in: col, options: options)
            } else {
                allAssets = PHAsset.fetchAssets(with: options)
            }
        } else {
            allAssets = PHAsset.fetchAssets(with: options)
        }
        
        let totalCount = allAssets.count
        guard offset < totalCount else { return [] }
        let end = min(offset + limit, totalCount)
        
        var results: [PhotoMetadata] = []
        for i in offset..<end {
            let asset = allAssets.object(at: i)
            let resources = PHAssetResource.assetResources(for: asset)
            let originalFilename = resources.first?.originalFilename ?? "IMG_\(i).JPG"
            let isLive = asset.mediaSubtypes.contains(.photoLive)
            
            let item = PhotoMetadata(
                id: asset.localIdentifier,
                filename: originalFilename,
                mediaType: asset.mediaType == .video ? "video" : "image",
                creationDate: asset.creationDate,
                pixelWidth: asset.pixelWidth,
                pixelHeight: asset.pixelHeight,
                durationSeconds: asset.mediaType == .video ? asset.duration : nil,
                isFavorite: asset.isFavorite,
                isLivePhoto: isLive,
                chatSource: albumName
            )
            results.append(item)
        }
        
        return results
    }
    
    /// Tạo thumbnail kích thước nhỏ 250x250 siêu nhanh phục vụ giao diện lưới Desktop
    public func generateThumbnail(for assetId: String, targetSize: CGSize = CGSize(width: 250, height: 250)) async -> Data? {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
        guard let asset = assets.firstObject else { return nil }
        
        let options = PHImageRequestOptions()
        options.deliveryMode = .fastFormat
        options.isNetworkAccessAllowed = true
        options.resizeMode = .fast
        options.isSynchronous = false
        
        return await withCheckedContinuation { continuation in
            imageManager.requestImage(
                for: asset,
                targetSize: targetSize,
                contentMode: .aspectFill,
                options: options
            ) { image, _ in
                guard let image = image, let jpegData = image.jpegData(compressionQuality: 0.75) else {
                    continuation.resume(returning: nil)
                    return
                }
                continuation.resume(returning: jpegData)
            }
        }
    }
    
    /// Xuất video chuyển động 3 giây (.mov) đi kèm Live Photo
    public func exportLivePhotoPairedVideo(assetId: String) async throws -> (data: Data, filename: String) {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
        guard let asset = assets.firstObject, asset.mediaSubtypes.contains(.photoLive) else {
            throw NSError(domain: "PhotoKitService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Not a live photo"])
        }
        
        let resources = PHAssetResource.assetResources(for: asset)
        guard let videoResource = resources.first(where: { $0.type == .pairedVideo }) else {
            throw NSError(domain: "PhotoKitService", code: 404, userInfo: [NSLocalizedDescriptionKey: "No paired video found for live photo"])
        }
        
        let tempUrl = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".mov")
        let options = PHAssetResourceRequestOptions()
        options.isNetworkAccessAllowed = true
        
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            PHAssetResourceManager.default().writeData(for: videoResource, toFile: tempUrl, options: options) { error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: ())
                }
            }
        }
        
        let data = try Data(contentsOf: tempUrl)
        try? FileManager.default.removeItem(at: tempUrl)
        let filename = (videoResource.originalFilename as NSString).deletingPathExtension + ".mov"
        return (data, filename)
    }
    
    /// Đọc dữ liệu ảnh gốc hoặc tự động chuyển đổi HEIC sang JPEG qua CoreImage
    public func exportMediaData(assetId: String, convertHeicToJpeg: Bool = true) async throws -> (data: Data, mimeType: String, filename: String) {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
        guard let asset = assets.firstObject else {
            throw NSError(domain: "PhotoKitService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Asset not found"])
        }
        
        let resources = PHAssetResource.assetResources(for: asset)
        let originalFilename = resources.first?.originalFilename ?? "asset.dat"
        
        if asset.mediaType == .video {
            let videoOptions = PHVideoRequestOptions()
            videoOptions.isNetworkAccessAllowed = true
            videoOptions.deliveryMode = .highQualityFormat
            
            return try await withCheckedThrowingContinuation { continuation in
                imageManager.requestAVAsset(forVideo: asset, options: videoOptions) { avAsset, _, _ in
                    guard let urlAsset = avAsset as? AVURLAsset else {
                        continuation.resume(throwing: NSError(domain: "PhotoKitService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Failed to load video URL"]))
                        return
                    }
                    do {
                        let data = try Data(contentsOf: urlAsset.url)
                        continuation.resume(returning: (data, "video/mp4", originalFilename))
                    } catch {
                        continuation.resume(throwing: error)
                    }
                }
            }
        }
        
        let imageOptions = PHImageRequestOptions()
        imageOptions.isNetworkAccessAllowed = true
        imageOptions.deliveryMode = .highQualityFormat
        imageOptions.version = .current
        
        return try await withCheckedThrowingContinuation { continuation in
            imageManager.requestImageDataAndOrientation(for: asset, options: imageOptions) { data, uti, _, _ in
                guard let rawData = data else {
                    continuation.resume(throwing: NSError(domain: "PhotoKitService", code: 500, userInfo: [NSLocalizedDescriptionKey: "Failed to read image data"]))
                    return
                }
                
                let isHeic = (uti?.contains("heic") ?? false) || originalFilename.uppercased().hasSuffix(".HEIC")
                
                if isHeic && convertHeicToJpeg {
                    if let uiImage = UIImage(data: rawData),
                       let jpegData = uiImage.jpegData(compressionQuality: 0.85) {
                        let newFilename = (originalFilename as NSString).deletingPathExtension + ".jpg"
                        continuation.resume(returning: (jpegData, "image/jpeg", newFilename))
                        return
                    }
                }
                
                let mimeType = isHeic ? "image/heic" : "image/jpeg"
                continuation.resume(returning: (rawData, mimeType, originalFilename))
            }
        }
    }
    
    /// Dọn dẹp: Xóa danh sách ảnh/video trên điện thoại sau khi đã sao lưu an toàn sang PC
    public func deleteAssets(assetIds: [String]) async throws -> Bool {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: assetIds, options: nil)
        guard assets.count > 0 else { return false }
        
        return try await withCheckedThrowingContinuation { continuation in
            PHPhotoLibrary.shared().performChanges({
                PHAssetChangeRequest.deleteAssets(assets)
            }) { success, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: success)
                }
            }
        }
    }
}
