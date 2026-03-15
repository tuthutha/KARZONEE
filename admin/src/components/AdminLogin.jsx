import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logocar.png";

const ADMIN_EMAIL = "karzone68@gmail.com";
const ADMIN_PASSWORD = "canvantu06082003";
const ADMIN_STORAGE_KEY = "admin_authenticated";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      navigate("/", { replace: true });
      return;
    }

    setError("Email hoặc mật khẩu admin không đúng.");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(90deg,#0f172a_0%,#1e293b_45%,#0f172a_100%)] text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="w-full max-w-[1100px] mx-auto bg-white text-slate-700 rounded-full px-8 py-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Karzone Admin" className="h-12 object-contain" />
            <span className="text-4xl font-bold tracking-wide text-slate-800">
              ADMIN
            </span>
          </div>
        </div>

        <div className="max-w-xl mx-auto mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-orange-400">
            Đăng nhập Admin
          </h1>
          <p className="text-center text-slate-300 mt-4">
            Vui lòng đăng nhập để truy cập trang quản trị Karzone
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email đăng nhập
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email admin"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4 text-white outline-none focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4 text-white outline-none focus:border-orange-400"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 transition px-5 py-4 font-bold text-white text-lg shadow-lg"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;