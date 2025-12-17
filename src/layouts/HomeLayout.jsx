import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} <b>Ciptain</b> — Menciptakan Kesan Digital
      </footer>
    </div>
  );
}
