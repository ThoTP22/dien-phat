import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/upload_service.dart';

/// Widget hiển thị nhóm ảnh + nút thêm ảnh (chụp / thư viện)
/// [label]      - Tên nhóm: "Ảnh tiếp nhận", "Ảnh lỗi", "Ảnh hoàn thành"
/// [imageUrls]  - Danh sách URL ảnh hiện có
/// [onChanged]  - Callback trả về danh sách URL mới sau khi upload xong
/// [readOnly]   - Chỉ xem, không cho thêm/xóa
class TicketImageSection extends StatefulWidget {
  final String label;
  final List<String> imageUrls;
  final Future<void> Function(List<String> newUrls)? onChanged;
  final bool readOnly;

  const TicketImageSection({
    super.key,
    required this.label,
    required this.imageUrls,
    this.onChanged,
    this.readOnly = false,
  });

  @override
  State<TicketImageSection> createState() => _TicketImageSectionState();
}

class _TicketImageSectionState extends State<TicketImageSection> {
  final _picker = ImagePicker();
  final _uploadService = UploadService();
  bool _uploading = false;

  Future<void> _pickImages(ImageSource source) async {
    List<XFile> picked;
    if (source == ImageSource.gallery) {
      picked = await _picker.pickMultiImage(imageQuality: 80);
    } else {
      final f = await _picker.pickImage(
          source: ImageSource.camera, imageQuality: 80);
      picked = f != null ? [f] : [];
    }
    if (picked.isEmpty) return;

    setState(() => _uploading = true);
    try {
      final uploaded = await _uploadService.uploadImages(picked);
      final merged = [...widget.imageUrls, ...uploaded];
      await widget.onChanged?.call(merged);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  void _showPickerDialog() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Chụp ảnh'),
              onTap: () {
                Navigator.pop(context);
                _pickImages(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Chọn từ thư viện'),
              onTap: () {
                Navigator.pop(context);
                _pickImages(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _viewImage(int index) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _ImageViewerScreen(
          urls: widget.imageUrls,
          initialIndex: index,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final urls = widget.imageUrls;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(widget.label,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    )),
            const Spacer(),
            if (!widget.readOnly)
              _uploading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : TextButton.icon(
                      onPressed: _showPickerDialog,
                      icon: const Icon(Icons.add_a_photo, size: 18),
                      label: const Text('Thêm ảnh'),
                    ),
          ],
        ),
        const SizedBox(height: 8),
        if (urls.isEmpty && widget.readOnly)
          const Text('Chưa có ảnh', style: TextStyle(color: Colors.grey))
        else
          SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: urls.length + (widget.readOnly ? 0 : 0),
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final url = urls[i];
                return GestureDetector(
                  onTap: () => _viewImage(i),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      url,
                      width: 90,
                      height: 90,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 90,
                        height: 90,
                        color: Colors.grey[200],
                        child: const Icon(Icons.broken_image,
                            color: Colors.grey),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

// ---- Full-screen image viewer ----
class _ImageViewerScreen extends StatefulWidget {
  final List<String> urls;
  final int initialIndex;
  const _ImageViewerScreen(
      {required this.urls, required this.initialIndex});

  @override
  State<_ImageViewerScreen> createState() => _ImageViewerScreenState();
}

class _ImageViewerScreenState extends State<_ImageViewerScreen> {
  late PageController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = PageController(initialPage: widget.initialIndex);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: PageView.builder(
        controller: _ctrl,
        itemCount: widget.urls.length,
        itemBuilder: (_, i) => InteractiveViewer(
          child: Center(
            child: Image.network(
              widget.urls[i],
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) =>
                  const Icon(Icons.broken_image, color: Colors.white, size: 64),
            ),
          ),
        ),
      ),
    );
  }
}
