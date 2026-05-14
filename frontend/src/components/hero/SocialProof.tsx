"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const images = [
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
];

export function SocialProof() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:py-10 md:px-4 md:py-12 border-t border-zinc-100 bg-zinc-50/50 mt-12 rounded-3xl">
      <ScrollReveal>
        <header className="mb-8 text-center flex flex-col items-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
            Khách hàng đã lắp ráp
          </span>
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Hình ảnh thi công thực tế</h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Đội ngũ kĩ thuật viên Điện Phát thi công chuyên nghiệp, đảm bảo thẩm mỹ và tiêu chuẩn kĩ thuật khắt khe. Trải nghiệm không gian sống lý tưởng cùng Midea.
          </p>
        </header>

        <div className="columns-2 gap-3 md:columns-3 lg:columns-4 space-y-3 px-2">
          {images.map((src, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-2xl cursor-pointer group break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5"
              onClick={() => setSelectedImage(src)}
              whileHover={{ y: -5 }}
            >
              <img
                src={src}
                alt="Thi công điều hòa"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-white/95 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Xem chi tiết
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Thi công thực tế phóng to"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
