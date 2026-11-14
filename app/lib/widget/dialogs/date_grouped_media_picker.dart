import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:photo_manager/photo_manager.dart';

/// Đại diện cho một nhóm ảnh/video theo ngày
class DateGroupedAssets {
  final DateTime date;
  final List<AssetEntity> assets;

  DateGroupedAssets({required this.date, required this.assets});
}

/// Màn hình chọn ảnh & video phân cụm theo ngày (Date-Grouped Media Picker)
/// Tối ưu hóa chọn số lượng lớn không gây lag, có nút chọn cả ngày
class DateGroupedMediaPicker extends StatefulWidget {
  final int maxAssets;

  const DateGroupedMediaPicker({
    super.key,
    this.maxAssets = 5000,
  });

  @override
  State<DateGroupedMediaPicker> createState() => _DateGroupedMediaPickerState();
}

class _DateGroupedMediaPickerState extends State<DateGroupedMediaPicker> {
  final Set<AssetEntity> _selectedAssets = {};
  final Map<DateTime, List<AssetEntity>> _groupedAssets = {};
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMedia();
  }

  Future<void> _loadMedia() async {
    setState(() => _isLoading = true);

    try {
      final PermissionState ps = await PhotoManager.requestPermissionExtend();
      if (!ps.isAuth && !ps.hasAccess) {
        setState(() {
          _isLoading = false;
          _error = 'Quyền truy cập thư viện ảnh bị từ chối';
        });
        return;
      }

      final List<AssetPathEntity> albums = await PhotoManager.getAssetPathList(
        type: RequestType.common,
        onlyAll: true,
      );

      if (albums.isEmpty) {
        setState(() => _isLoading = false);
        return;
      }

      final recentAlbum = albums.first;
      final int totalCount = await recentAlbum.assetCountAsync;

      // Đọc tối đa các items mới nhất
      final List<AssetEntity> rawAssets = await recentAlbum.getAssetListRange(
        start: 0,
        end: totalCount > widget.maxAssets ? widget.maxAssets : totalCount,
      );

      final Map<DateTime, List<AssetEntity>> tempGroup = {};
      for (final asset in rawAssets) {
        final createDate = asset.createDateTime;
        final dateKey = DateTime(createDate.year, createDate.month, createDate.day);
        tempGroup.putIfAbsent(dateKey, () => []).add(asset);
      }

      setState(() {
        _groupedAssets.addAll(tempGroup);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Lỗi tải ảnh: $e';
      });
    }
  }

  String _formatDateTitle(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    if (date == today) return 'Hôm nay';
    if (date == yesterday) return 'Hôm qua';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  void _toggleGroupSelection(List<AssetEntity> groupAssets) {
    setState(() {
      final isAllSelected = groupAssets.every((a) => _selectedAssets.contains(a));
      if (isAllSelected) {
        _selectedAssets.removeAll(groupAssets);
      } else {
        for (final asset in groupAssets) {
          if (_selectedAssets.length < widget.maxAssets) {
            _selectedAssets.add(asset);
          }
        }
      }
    });
  }

  void _toggleSingleSelection(AssetEntity asset) {
    setState(() {
      if (_selectedAssets.contains(asset)) {
        _selectedAssets.remove(asset);
      } else {
        if (_selectedAssets.length < widget.maxAssets) {
          _selectedAssets.add(asset);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selectedCount = _selectedAssets.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chọn Ảnh & Video Theo Ngày'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: FilledButton.tonal(
              onPressed: selectedCount == 0 ? null : () => Navigator.pop(context, _selectedAssets.toList()),
              child: Text(
                'Gửi ($selectedCount)',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _groupedAssets.isEmpty
                  ? const Center(child: Text('Không có tệp đa phương tiện nào'))
                  : CustomScrollView(
                      physics: const BouncingScrollPhysics(),
                      slivers: _groupedAssets.entries.map((entry) {
                        final date = entry.key;
                        final assets = entry.value;
                        final isAllSelected = assets.every((a) => _selectedAssets.contains(a));
                        final selectedInGroupCount = assets.where((a) => _selectedAssets.contains(a)).length;

                        return SliverMainAxisGroup(
                          slivers: [
                            SliverToBoxAdapter(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                color: theme.colorScheme.surfaceVariant.withOpacity(0.4),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          _formatDateTitle(date),
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '($selectedInGroupCount/${assets.length})',
                                          style: TextStyle(
                                            color: theme.textTheme.bodySmall?.color,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                    InkWell(
                                      onTap: () => _toggleGroupSelection(assets),
                                      borderRadius: BorderRadius.circular(6),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        child: Row(
                                          children: [
                                            Text(
                                              isAllSelected ? 'Bỏ chọn' : 'Chọn cả ngày',
                                              style: TextStyle(
                                                color: theme.colorScheme.primary,
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Icon(
                                              isAllSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                                              color: theme.colorScheme.primary,
                                              size: 20,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            SliverPadding(
                              padding: const EdgeInsets.all(2),
                              sliver: SliverGrid(
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 4,
                                  mainAxisSpacing: 2,
                                  crossAxisSpacing: 2,
                                ),
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    final asset = assets[index];
                                    final isSelected = _selectedAssets.contains(asset);

                                    return GestureDetector(
                                      onTap: () => _toggleSingleSelection(asset),
                                      child: Stack(
                                        fit: StackFit.expand,
                                        children: [
                                          _AssetThumbnailWidget(asset: asset),
                                          if (asset.type == AssetType.video)
                                            Positioned(
                                              left: 4,
                                              bottom: 4,
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                                decoration: BoxDecoration(
                                                  color: Colors.black.withOpacity(0.7),
                                                  borderRadius: BorderRadius.circular(3),
                                                ),
                                                child: Text(
                                                  _formatDuration(asset.duration),
                                                  style: const TextStyle(color: Colors.white, fontSize: 10),
                                                ),
                                              ),
                                            ),
                                          Positioned(
                                            top: 4,
                                            right: 4,
                                            child: AnimatedContainer(
                                              duration: const Duration(milliseconds: 150),
                                              width: 22,
                                              height: 22,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: isSelected ? theme.colorScheme.primary : Colors.black.withOpacity(0.35),
                                                border: Border.all(color: Colors.white, width: 1.5),
                                              ),
                                              child: isSelected
                                                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                                                  : null,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                  childCount: assets.length,
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
      bottomNavigationBar: selectedCount > 0
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: theme.colorScheme.surface,
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Đã chọn $selectedCount tệp',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    FilledButton.icon(
                      onPressed: () => Navigator.pop(context, _selectedAssets.toList()),
                      icon: const Icon(Icons.send_rounded),
                      label: const Text('Tiến hành chuyển'),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }

  String _formatDuration(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }
}

class _AssetThumbnailWidget extends StatelessWidget {
  final AssetEntity asset;

  const _AssetThumbnailWidget({required this.asset});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Uint8List?>(
      future: asset.thumbnailDataWithSize(const ThumbnailSize(200, 200)),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done && snapshot.data != null) {
          return Image.memory(
            snapshot.data!,
            fit: BoxFit.cover,
            gaplessPlayback: true,
          );
        }
        return Container(color: Colors.grey.shade300);
      },
    );
  }
}
