"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Crash]", error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="bg-[#0b0c10] text-[#c5a880] flex items-center justify-center min-h-screen p-6 font-sans">
        <div className="max-w-md w-full bg-[#14161d] border border-[#2d3139] p-8 rounded-3xl text-center shadow-2xl space-y-4">
          <h1 className="text-xl font-bold text-white">Elmira Davet & Balo Salonu</h1>
          <p className="text-xs text-gray-400">
            Sistemde kritik bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-[#c5a880] text-black font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            Yenile ve Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
