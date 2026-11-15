import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:photo_manager/photo_manager.dart';

/// Đại diện cho nhóm Năm-Tháng
class YearMonthKey implements Comparable<YearMonthKey> {
  final int year;
  final int month;

  const YearMonthKey(this.year, this.month);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is YearMonthKey && runtimeType == other.runtimeType && year == other.year && month == other.month;

  @override
  int get hashCode => year.hashCode ^ month.hashCode;

  @override
  int compareTo(YearMonthKey other) {
    if (year != other.year) {
      return other.year.compareTo(year); // Mới nhất lên trước
    }
    return other.month.compareTo(month);
  }

  String get title {
    final now = DateTime.now();
    if (year == now.year && month == now.month) {
      return 'Tháng này (${month.toString().padLeft(2, '0')}/$year)';
    }
    return 'Tháng ${month.toString().padLeft(2, '0')} / $year';
  }

  String get shortTitle => '${month.toString().padLeft(2, '0')}/$year';
}

/// Màn hình chọn ảnh & video phân nhóm theo Năm - Tháng
/// Hỗ trợ chọn cả 1 tháng chỉ bằng 1 lần click, nhận diện Apple Live Photo
class DateGroupedMediaPicker extends StatefulWidget {
  final int maxAssets;

  const DateGroupedMediaPicker({
    super.key,
    this.maxAssets = 10000,
  });

  @override
  State<DateGroupedMediaPicker> createState() => _DateGroupedMediaPickerState();
}

class _DateGroupedMediaPickerState extends State<DateGroupedMediaPicker> {
  final Set<AssetEntity> _selectedAssets = {};
  final Map<YearMonthKey, List<AssetEntity>> _groupedAssets = {};
  List<YearMonthKey> _sortedKeys = [];
  YearMonthKey? _filterKey; // null = xem tất cả
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

      final List<AssetEntity> rawAssets = await recentAlbum.getAssetListRange(
        start: 0,
        end: totalCount > widget.maxAssets ? widget.maxAssets : totalCount,
      );

      final Map<YearMonthKey, List<AssetEntity>> tempGroup = {};
      for (final asset in rawAssets) {
        final createDate = asset.createDateTime;
        final ymKey = YearMonthKey(createDate.year, createDate.month);
        tempGroup.putIfAbsent(ymKey, () => []).add(asset);
      }

      final sorted = tempGroup.keys.toList()..sort();

      setState(() {
        _groupedAssets.clear();
        _groupedAssets.addAll(tempGroup);
        _sortedKeys = sorted;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Lỗi tải ảnh: $e';
      });
    }
  }

  void _toggleMonthSelection(YearMonthKey ymKey, List<AssetEntity> monthAssets) {
    setState(() {
      final isAllSelected = monthAssets.every((a) => _selectedAssets.contains(a));
      if (isAllSelected) {
        _selectedAssets.removeAll(monthAssets);
      } else {
        for (final asset in monthAssets) {
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
    final livePhotoCount = _selectedAssets.where((a) => a.isLivePhoto).length;

    final displayKeys = _filterKey != null ? [_filterKey!] : _sortedKeys;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Chọn Ảnh Theo Năm Tháng',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          if (selectedCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: FilledButton.tonal(
                onPressed: () => Navigator.pop(context, _selectedAssets.toList()),
                child: Text(
                  'Chọn xong ($selectedCount)',
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
                  : Column(
                      children: [
                        // Thanh lọc nhanh Năm - Tháng (Quick Filter Chips)
                        if (_sortedKeys.length > 1)
                          Container(
                            height: 48,
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            color: theme.colorScheme.surfaceVariant.withOpacity(0.2),
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              itemCount: _sortedKeys.length + 1,
                              separatorBuilder: (_, __) => const SizedBox(width: 8),
                              itemBuilder: (context, index) {
                                if (index == 0) {
                                  final isSelected = _filterKey == null;
                                  return ChoiceChip(
                                    label: const Text('Tất cả các tháng'),
                                    selected: isSelected,
                                    onSelected: (_) => setState(() => _filterKey = null),
                                  );
                                }
                                final ym = _sortedKeys[index - 1];
                                final isSelected = _filterKey == ym;
                                return ChoiceChip(
                                  label: Text(ym.shortTitle),
                                  selected: isSelected,
                                  onSelected: (_) => setState(() => _filterKey = isSelected ? null : ym),
                                );
                              },
                            ),
                          ),

                        // Danh sách nhóm ảnh theo tháng
                        Expanded(
                          child: CustomScrollView(
                            physics: const BouncingScrollPhysics(),
                            slivers: displayKeys.map((ymKey) {
                              final assets = _groupedAssets[ymKey] ?? [];
                              final isAllSelected = assets.isNotEmpty && assets.every((a) => _selectedAssets.contains(a));
                              final selectedInMonthCount = assets.where((a) => _selectedAssets.contains(a)).length;

                              return SliverMainAxisGroup(
                                slivers: [
                                  // Tiêu đề Tháng + Nút 1 CHẠM CHỌN CẢ THÁNG
                                  SliverToBoxAdapter(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.surfaceVariant.withOpacity(0.5),
                                        border: Border(
                                          bottom: BorderSide(
                                            color: theme.dividerColor.withOpacity(0.2),
                                          ),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                ymKey.title,
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                'Đã chọn: $selectedInMonthCount / ${assets.length} tệp',
                                                style: TextStyle(
                                                  color: theme.textTheme.bodySmall?.color,
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ],
                                          ),

                                          // NÚT CHỌN CẢ THÁNG 1 LẦN
                                          FilledButton.tonalIcon(
                                            style: FilledButton.styleFrom(
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                              visualDensity: VisualDensity.compact,
                                              backgroundColor: isAllSelected
                                                  ? theme.colorScheme.primaryContainer
                                                  : theme.colorScheme.surface,
                                            ),
                                            onPressed: () => _toggleMonthSelection(ymKey, assets),
                                            icon: Icon(
                                              isAllSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                                              size: 18,
                                              color: isAllSelected ? theme.colorScheme.primary : null,
                                            ),
                                            label: Text(
                                              isAllSelected ? 'Bỏ chọn cả tháng' : 'Chọn cả tháng',
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: isAllSelected ? theme.colorScheme.primary : null,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),

                                  // Lưới ảnh của tháng
                                  SliverPadding(
                                    padding: const EdgeInsets.all(4.0),
                                    sliver: SliverGrid(
                                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 3,
                                        crossAxisSpacing: 4,
                                        mainAxisSpacing: 4,
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
                                                ClipRRect(
                                                  borderRadius: BorderRadius.circular(4),
                                                  child: _AssetThumbnailWidget(asset: asset),
                                                ),

                                                // Lớp phủ khi được chọn
                                                if (isSelected)
                                                  Container(
                                                    decoration: BoxDecoration(
                                                      borderRadius: BorderRadius.circular(4),
                                                      color: theme.colorScheme.primary.withOpacity(0.35),
                                                      border: Border.all(
                                                        color: theme.colorScheme.primary,
                                                        width: 2.5,
                                                      ),
                                                    ),
                                                  ),

                                                // Badge Live Photo (Xuất cả Ảnh + Video)
                                                if (asset.isLivePhoto)
                                                  Positioned(
                                                    left: 4,
                                                    top: 4,
                                                    child: Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                                      decoration: BoxDecoration(
                                                        color: Colors.amber.shade700.withOpacity(0.9),
                                                        borderRadius: BorderRadius.circular(4),
                                                      ),
                                                      child: const Row(
                                                        mainAxisSize: MainAxisSize.min,
                                                        children: [
                                                          Icon(Icons.motion_photos_on_rounded, size: 11, color: Colors.white),
                                                          SizedBox(width: 2),
                                                          Text(
                                                            'LIVE',
                                                            style: TextStyle(
                                                              color: Colors.white,
                                                              fontSize: 9,
                                                              fontWeight: FontWeight.bold,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),

                                                // Thời lượng Video
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

                                                // Icon Checkbox ở góc phải
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
                        ),
                      ],
                    ),

      // Thanh điều hướng dưới cùng (Bottom Action Bar)
      bottomNavigationBar: selectedCount > 0
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Đã chọn: $selectedCount tệp',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        if (livePhotoCount > 0)
                          Text(
                            '+ $livePhotoCount video Live Photo tự động xuất',
                            style: TextStyle(
                              color: Colors.amber.shade800,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                    FilledButton.icon(
                      onPressed: () => Navigator.pop(context, _selectedAssets.toList()),
                      icon: const Icon(Icons.send_rounded),
                      label: const Text('Tiến hành gửi'),
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
