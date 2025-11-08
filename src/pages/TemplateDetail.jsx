// src/pages/TemplateDetail.jsx
import { useParams, Link } from "react-router-dom";
import { templates } from "../data/templates";
import WeddingLayout from "../layouts/WeddingLayout";
import PortfolioLayout from "../layouts/PortfolioLayout";

export default function TemplateDetail() {
  const { id } = useParams();
  const template = templates.find((t) => t.id === Number(id));

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <p>Template tidak ditemukan 😢</p>
        <Link to="/shop" className="text-blue-600 mt-4 underline">
          Kembali ke Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-gray-800">{template.name}</h1>
        <p className="text-gray-500">
          {template.category} • {template.price}
        </p>
      </div>

      {/* Layout dinamis */}
      {template.layout === "wedding" && (
        <WeddingLayout data={template.content} />
      )}
      {template.layout === "portfolio" && (
        <PortfolioLayout data={template.content} />
      )}
      {template.layout === "shop" && <ShopLayout data={template.content} />}

      {/* Tombol kembali */}
      <div className="text-center my-10">
        <Link
          to="/shop"
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          ← Kembali ke Shop
        </Link>
      </div>
    </div>
  );
}
