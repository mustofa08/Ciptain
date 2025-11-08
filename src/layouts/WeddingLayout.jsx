// src/layouts/WeddingLayout.jsx
export default function WeddingLayout({ data }) {
  return (
    <div
      className="flex flex-col items-center text-center py-16"
      style={{ backgroundColor: data.themeColor || "#FFF" }}
    >
      <h2 className="text-5xl font-serif text-gray-800 mb-4">{data.title}</h2>
      <p className="text-lg text-gray-700">{data.quote}</p>
      <p className="mt-6 text-xl text-gray-800 font-medium">💍 {data.date}</p>
    </div>
  );
}
