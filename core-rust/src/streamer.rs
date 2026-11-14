use bytes::{Bytes, BytesMut};
use std::path::Path;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt, BufWriter};
use tracing::{error, info};

pub const DEFAULT_CHUNK_SIZE: usize = 1024 * 1024; // 1 MB buffer tối ưu cho Wi-Fi 5/6

pub struct ChunkStreamer;

impl ChunkStreamer {
    /// Đọc file theo chunk stream không nạp toàn bộ vào RAM (Memory-efficient streaming)
    pub async fn stream_file_to_sink<F, Fut>(
        file_path: &Path,
        chunk_size: usize,
        mut on_chunk: F,
    ) -> Result<u64, Box<dyn std::error::Error + Send + Sync>>
    where
        F: FnMut(Bytes) -> Fut,
        Fut: std::future::Future<Output = Result<(), Box<dyn std::error::Error + Send + Sync>>>,
    {
        let mut file = File::open(file_path).await?;
        let mut buffer = BytesMut::with_capacity(chunk_size);
        let mut total_bytes: u64 = 0;

        loop {
            buffer.clear();
            let n = file.read_buf(&mut buffer).await?;
            if n == 0 {
                break;
            }
            total_bytes += n as u64;
            let chunk = buffer.split().freeze();
            on_chunk(chunk).await?;
        }

        info!("Đã stream hoàn tất {} bytes cho {:?}", total_bytes, file_path);
        Ok(total_bytes)
    }

    /// Ghi luồng chunk nhận được từ socket xuống file với BufWriter
    pub async fn write_stream_to_file<S>(
        dest_path: &Path,
        mut stream: S,
    ) -> Result<u64, Box<dyn std::error::Error + Send + Sync>>
    where
        S: futures_util::Stream<Item = Result<Bytes, std::io::Error>> + Unpin,
    {
        use futures_util::StreamExt;

        let file = File::create(dest_path).await?;
        let mut writer = BufWriter::with_capacity(DEFAULT_CHUNK_SIZE, file);
        let mut total_written: u64 = 0;

        while let Some(chunk_res) = stream.next().await {
            match chunk_res {
                Ok(chunk) => {
                    writer.write_all(&chunk).await?;
                    total_written += chunk.len() as u64;
                }
                Err(e) => {
                    error!("Lỗi đọc chunk từ stream mạng: {}", e);
                    return Err(Box::new(e));
                }
            }
        }

        writer.flush().await?;
        info!("Đã ghi thành công {} bytes vào {:?}", total_written, dest_path);
        Ok(total_written)
    }
}
