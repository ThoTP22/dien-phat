import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../core/api_client.dart';

class UploadService {
  final _api = ApiClient();

  /// Upload nhiều ảnh lên S3 qua backend, trả về danh sách URL.
  /// Dùng XFile để tương thích cả mobile lẫn Flutter Web.
  Future<List<String>> uploadImages(
    List<XFile> files, {
    String folder = 'repair-tickets',
  }) async {
    final formData = FormData();

    for (final file in files) {
      final bytes = await file.readAsBytes();
      final name = file.name.isNotEmpty
          ? file.name
          : file.path.split('/').last;
      formData.files.add(MapEntry(
        'files',
        MultipartFile.fromBytes(bytes, filename: name),
      ));
    }

    formData.fields.add(MapEntry('folder', folder));

    final resp = await _api.dio.post(
      '/uploads/images',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );

    final fileList = (resp.data['data']?['files'] as List?) ?? [];
    return fileList
        .map((f) => (f['url'] as String?) ?? '')
        .where((url) => url.isNotEmpty)
        .toList();
  }
}
