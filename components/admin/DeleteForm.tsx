"use client";

export default function DeleteForm({
  action,
  id,
  confirmText,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirmText: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}
