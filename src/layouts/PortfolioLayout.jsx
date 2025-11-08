// src/layouts/PortfolioLayout.jsx
export default function PortfolioLayout({ data }) {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h2 className="text-4xl font-bold text-gray-800">{data.name}</h2>
      <p className="text-blue-600 text-lg">{data.role}</p>
      <p className="mt-4 text-gray-600">{data.bio}</p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.projects.map((proj, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <p className="text-gray-800 font-medium">{proj}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
