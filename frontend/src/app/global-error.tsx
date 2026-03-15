"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <h2 className="text-lg font-semibold">Đã xảy ra lỗi</h2>
          <p className="text-sm text-zinc-600">
            Vui lòng thử lại sau.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
