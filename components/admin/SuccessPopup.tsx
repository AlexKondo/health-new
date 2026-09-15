"use client";

export default function SuccessPopup({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <p className="mt-4 text-lg font-bold text-brand-dark">{message}</p>
        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-brand px-6 py-2.5 font-bold text-white hover:bg-brand-dark"
        >
          Ok
        </button>
      </div>
    </div>
  );
}
