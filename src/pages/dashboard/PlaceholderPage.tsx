export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl text-gray-400">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-center max-w-md">
        Halaman ini sedang dalam tahap pengembangan. Fitur akan segera tersedia di versi berikutnya.
      </p>
    </div>
  );
}
