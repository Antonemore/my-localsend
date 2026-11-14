import Foundation
import Photos
import CoreImage
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
}

/// Dịch vụ quản lý truy xuất và chuyển đổi ảnh/video qua PhotoKit
public final class PhotoKitService: NSObject {
    public static let shared = PhotoKitService()
    
    private let imageManager = PHCachingImageManager.default()
    private let ciContext = CIContext(options: [.useSoftwareRenderer: false])
    
    private override init() {
        super.init()
    }
    
    /// Yêu cầu quyền truy cập thư viện ảnh
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
    
    /// Lấy danh sách ảnh/video có phân trang
    public func fetchAssets(offset: Int, limit: Int) -> [PhotoMetadata] {
        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        options.includeAssetSourceTypes = [.typeUserLibrary, .typeCloudShared, .typeiTunesSynced]
        
        let allAssets = PHAsset.fetchAssets(with: options)
        let totalCount = allAssets.count
        
        guard offset < totalCount else { return [] }
        let end = min(offset + limit, totalCount)
        
        var results: [PhotoMetadata] = []
        for i in offset..<end {
            let asset = allAssets.object(at: i)
            let resources = PHAssetResource.assetResources(for: asset)
            let originalFilename = resources.first?.originalFilename ?? "IMG_\(i).JPG"
            
            let item = PhotoMetadata(
                id: asset.localIdentifier,
                filename: originalFilename,
                mediaType: asset.mediaType == .video ? "video" : "image",
                creationDate: asset.creationDate,
                pixelWidth: asset.pixelWidth,
                pixelHeight: asset.pixelHeight,
                durationSeconds: asset.mediaType == .video ? asset.duration : nil,
                isFavorite: asset.isFavorite
            )
            results.append(item)
        }
        
        return results
    }
    
    /// Tạo thumbnail kích thước nhỏ 200x200 siêu nhanh phục vụ giao diện lưới Desktop
    public func generateThumbnail(for assetId: String, targetSize: CGSize = CGSize(width: 200, height: 200)) async -> Data? {
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
                guard let image = image, let jpegData = image.jpegData(compressionQuality: 0.7) else {
                    continuation.resume(returning: nil)
                    return
                }
                continuation.resume(returning: jpegData)
            }
        }
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
            // Xử lý xuất Video
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
        
        // Xử lý xuất Ảnh
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
                    // Chuyển đổi HEIC sang JPEG tức thời bằng GPU CoreImage
                    if let ciImage = CIImage(data: rawData),
                       let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
                       let jpegData = self.ciContext.jpegRepresentation(of: ciImage, colorSpace: colorSpace, options: [kCGImageDestinationLossyFactor as CIImageRepresentationOption: 0.9]) {
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
}
