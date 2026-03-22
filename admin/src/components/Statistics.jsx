import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart3,
    Car,
    CalendarCheck,
    DollarSign,
    RefreshCw,
    Users,
} from "lucide-react";
import { formatVND } from "../utils/formatCurrency";

const baseURL = "http://localhost:5000";

const cardBase =
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg";
const titleClass = "text-slate-300 text-sm";
const valueClass = "text-white text-3xl font-bold mt-2";

const Statistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await axios.get(`${baseURL}/api/stats/dashboard`);
            setStats(data);
        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu thống kê.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020817] text-white px-6 pt-26 pb-10">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-bold text-orange-400 text-center mb-4">
                        Thống kê
                    </h1>
                    <p className="text-slate-300 text-center">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#020817] text-white px-6 pt-26 pb-10">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-bold text-orange-400 text-center mb-4">
                        Thống kê
                    </h1>
                    <p className="text-red-400 text-center mb-4">{error}</p>
                    <div className="flex justify-center">
                        <button
                            onClick={fetchStats}
                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 transition"
                        >
                            Tải lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const summary = stats?.summary || {};
    const bookingStatus = stats?.bookingStatus || {};
    const topCars = stats?.topCars || [];
    const revenueByMonth = stats?.revenueByMonth || [];
    const revenueByWeek = stats?.revenueByWeek || [];
    const revenueByYear = stats?.revenueByYear || [];

    return (
         <div className="min-h-screen bg-[#020817] text-white px-6 pt-26 pb-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-orange-400">
                            Thống kê
                        </h1>
                        <p className="text-slate-400 mt-4 text-lg">
                            Theo dõi tổng quan xe, đơn đặt xe và doanh thu của hệ thống.
                        </p>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={fetchStats}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                        >
                            <RefreshCw size={18} />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                    <div className={cardBase}>
                        <div className="flex items-center gap-3 text-orange-400">
                            <Car size={22} />
                            <span className={titleClass}>Tổng số xe</span>
                        </div>
                        <div className={valueClass}>{summary.totalCars || 0}</div>
                    </div>

                    <div className={cardBase}>
                        <div className="flex items-center gap-3 text-green-400">
                            <CalendarCheck size={22} />
                            <span className={titleClass}>Tổng đơn đặt xe</span>
                        </div>
                        <div className={valueClass}>{summary.totalBookings || 0}</div>
                    </div>

                    <div className={cardBase}>
                        <div className="flex items-center gap-3 text-cyan-400">
                            <Users size={22} />
                            <span className={titleClass}>Xe khả dụng</span>
                        </div>
                        <div className={valueClass}>{summary.availableCars || 0}</div>
                    </div>

                    <div className={cardBase}>
                        <div className="flex items-center gap-3 text-yellow-400">
                            <DollarSign size={22} />
                            <span className={titleClass}>Tổng doanh thu</span>
                        </div>
                        <div className={valueClass}>
                            {formatVND(summary.totalRevenue || 0)}
                        </div>
                    </div>
                </div>

                {/* Status + Top Cars */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <div className={cardBase}>
                        <div className="flex items-center gap-2 mb-5 text-orange-400">
                            <BarChart3 size={22} />
                            <h2 className="text-2xl font-semibold">Đơn đặt xe theo trạng thái</h2>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(bookingStatus).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                                >
                                    <span className="capitalize text-slate-300">{key}</span>
                                    <span className="font-bold text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cardBase}>
                        <div className="flex items-center gap-2 mb-5 text-orange-400">
                            <Car size={22} />
                            <h2 className="text-2xl font-semibold">Xe được đặt nhiều nhất</h2>
                        </div>

                        <div className="space-y-4">
                            {topCars.length === 0 ? (
                                <p className="text-slate-400">Chưa có dữ liệu.</p>
                            ) : (
                                topCars.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-semibold text-white">{item.carName}</p>
                                            <p className="text-sm text-slate-400">
                                                {item.bookingCount} lượt đặt
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-orange-400">
                                                {formatVND(item.revenue || 0)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Revenue by Month */}
                <div className={`${cardBase} mb-8`}>
                    <div className="flex items-center gap-2 mb-5 text-orange-400">
                        <DollarSign size={22} />
                        <h2 className="text-2xl font-semibold">Doanh thu theo tuần</h2>
                    </div>

                    {revenueByWeek.length === 0 ? (
                        <p className="text-slate-400">Chưa có dữ liệu doanh thu theo tuần.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-white/10">
                                        <th className="py-3">Tuần</th>
                                        <th className="py-3">Số đơn</th>
                                        <th className="py-3">Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueByWeek.map((item, index) => (
                                        <tr key={index} className="border-b border-white/5">
                                            <td className="py-3 text-white">{item.week}</td>
                                            <td className="py-3 text-white">{item.bookings}</td>
                                            <td className="py-3 text-orange-400 font-semibold">
                                                {formatVND(item.revenue || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Revenue by Week + Year */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className={cardBase}>
                        <div className="flex items-center gap-2 mb-5 text-orange-400">
                            <DollarSign size={22} />
                            <h2 className="text-2xl font-semibold">Doanh thu theo tháng</h2>
                        </div>

                        {revenueByMonth.length === 0 ? (
                            <p className="text-slate-400">Chưa có dữ liệu doanh thu theo tháng.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-white/10">
                                            <th className="py-3">Tháng</th>
                                            <th className="py-3">Số đơn</th>
                                            <th className="py-3">Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueByMonth.map((item, index) => (
                                            <tr key={index} className="border-b border-white/5">
                                                <td className="py-3 text-white">{item.month}</td>
                                                <td className="py-3 text-white">{item.bookings}</td>
                                                <td className="py-3 text-orange-400 font-semibold">
                                                    {formatVND(item.revenue || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className={cardBase}>
                        <div className="flex items-center gap-2 mb-5 text-orange-400">
                            <DollarSign size={22} />
                            <h2 className="text-2xl font-semibold">Doanh thu theo năm</h2>
                        </div>

                        {revenueByYear.length === 0 ? (
                            <p className="text-slate-400">Chưa có dữ liệu doanh thu theo năm.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-white/10">
                                            <th className="py-3">Năm</th>
                                            <th className="py-3">Số đơn</th>
                                            <th className="py-3">Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueByYear.map((item, index) => (
                                            <tr key={index} className="border-b border-white/5">
                                                <td className="py-3 text-white">{item.year}</td>
                                                <td className="py-3 text-white">{item.bookings}</td>
                                                <td className="py-3 text-orange-400 font-semibold">
                                                    {formatVND(item.revenue || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;