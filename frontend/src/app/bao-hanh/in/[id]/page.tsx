"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAdminRepairTicketById, RepairTicket, STATUS_LABELS, SERVICE_TYPE_LABELS, SERVICE_LOCATION_LABELS } from "@/services/repairTicket.service";
import { useAdminToken } from "@/lib/use-admin-token";

export default function PrintReceiptPage() {
  const token = useAdminToken();
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    fetchAdminRepairTicketById(id)
      .then((t) => {
        setTicket(t);
        // Đợi DOM render xong rồi in
        setTimeout(() => globalThis.print(), 300);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải phiếu"));
  }, [token, id]);

  if (!token) return null;

  if (error) {
    return (
      <div className="p-8 text-red-600 text-sm">{error}</div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-sm text-gray-500">Đang tải phiếu bảo hành...</div>
    );
  }

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div className="max-w-2xl mx-auto p-8 text-sm font-sans print:p-4 print:max-w-full">
      <style>{`
        @media print {
          body { font-size: 12px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Tiêu đề */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wide">PHIẾU BẢO HÀNH / DỊCH VỤ</h1>
        <p className="text-gray-500 text-xs mt-1">Điện Phát — Trung tâm bảo hành thiết bị điện tử</p>
      </div>

      {/* Số phiếu + ngày */}
      <div className="flex justify-between mb-4 border-b pb-3">
        <div>
          <span className="text-gray-500">Số phiếu:</span>{" "}
          <span className="font-mono font-bold text-base">{ticket.ticketNumber}</span>
        </div>
        <div className="text-right">
          <div>
            <span className="text-gray-500">Ngày nhận:</span> {fmt(ticket.receivedDate)}
          </div>
          <div>
            <span className="text-gray-500">Ngày hẹn:</span> {fmt(ticket.appointmentDate)}
          </div>
        </div>
      </div>

      {/* Khách hàng */}
      <section className="mb-4">
        <h2 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Thông tin khách hàng</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="text-gray-500 w-36 py-0.5">Họ tên:</td>
              <td className="font-medium">{ticket.customerName}</td>
            </tr>
            <tr>
              <td className="text-gray-500 py-0.5">Điện thoại:</td>
              <td>{ticket.customerPhone}</td>
            </tr>
            {ticket.customerAddress && (
              <tr>
                <td className="text-gray-500 py-0.5">Địa chỉ:</td>
                <td>{ticket.customerAddress}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Sản phẩm */}
      <section className="mb-4">
        <h2 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Thông tin thiết bị</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="text-gray-500 w-36 py-0.5">Sản phẩm:</td>
              <td className="font-medium">{ticket.productName || "—"}</td>
            </tr>
            {ticket.manufacturer && (
              <tr>
                <td className="text-gray-500 py-0.5">Hãng:</td>
                <td>{ticket.manufacturer}</td>
              </tr>
            )}
            {ticket.modelName && (
              <tr>
                <td className="text-gray-500 py-0.5">Model:</td>
                <td>{ticket.modelName}</td>
              </tr>
            )}
            {ticket.serialNumber && (
              <tr>
                <td className="text-gray-500 py-0.5">Serial:</td>
                <td className="font-mono">{ticket.serialNumber}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Tình trạng & dịch vụ */}
      <section className="mb-4">
        <h2 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Tình trạng & dịch vụ</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="text-gray-500 w-36 py-0.5">Hình thức BH:</td>
              <td>{SERVICE_TYPE_LABELS[ticket.serviceType]}</td>
            </tr>
            <tr>
              <td className="text-gray-500 py-0.5">Loại dịch vụ:</td>
              <td>{SERVICE_LOCATION_LABELS[ticket.serviceLocation]}</td>
            </tr>
            <tr>
              <td className="text-gray-500 py-0.5">Trạng thái:</td>
              <td className="font-medium">{STATUS_LABELS[ticket.status]}</td>
            </tr>
            {ticket.technician && (
              <tr>
                <td className="text-gray-500 py-0.5">Kỹ thuật viên:</td>
                <td>{ticket.technician.fullName}</td>
              </tr>
            )}
            {ticket.quotedPrice !== undefined && (
              <tr>
                <td className="text-gray-500 py-0.5">Báo giá:</td>
                <td className="font-semibold">{ticket.quotedPrice.toLocaleString("vi-VN")} ₫</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Mô tả hư hỏng */}
      {ticket.faultDescription && (
        <section className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Mô tả hư hỏng</h2>
          <p className="border border-gray-200 rounded p-3 text-sm text-gray-800 whitespace-pre-wrap bg-gray-50">
            {ticket.faultDescription}
          </p>
        </section>
      )}

      {/* Ghi chú khách hàng */}
      {ticket.note && (
        <section className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Ghi chú</h2>
          <p className="border border-gray-200 rounded p-3 text-sm text-gray-800 whitespace-pre-wrap bg-gray-50">
            {ticket.note}
          </p>
        </section>
      )}

      {/* Chữ ký */}
      <div className="mt-10 flex justify-between text-xs text-gray-500">
        <div className="text-center w-40">
          <div className="border-t border-gray-300 pt-2">Khách hàng</div>
          <div className="text-gray-400 italic">(Ký, ghi rõ họ tên)</div>
        </div>
        <div className="text-center w-40">
          <div className="border-t border-gray-300 pt-2">Người tiếp nhận</div>
          <div className="text-gray-400 italic">
            {ticket.receivedBy || "(Ký, ghi rõ họ tên)"}
          </div>
        </div>
      </div>

      {/* Nút in — ẩn khi print */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => globalThis.print()}
          className="px-6 py-2 bg-zinc-800 text-white rounded text-sm hover:bg-zinc-700"
        >
          In phiếu
        </button>
      </div>
    </div>
  );
}
