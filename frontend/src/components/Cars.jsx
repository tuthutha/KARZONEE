import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaGasPump,
  FaArrowRight,
  FaTachometerAlt,
  FaUserFriends,
  FaShieldAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { carPageStyles } from "../assets/dummyStyles";
import { formatVND } from "../utils/formatCurrency.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
// ceil so partial days count as next day
const daysBetween = (from, to) =>
  Math.ceil((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);

const getDailyRate = (car) => Number(car.dailyRate ?? car.price ?? car.pricePerDay ?? 0);

const Cars = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [seatFilter, setSeatFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortPrice, setSortPrice] = useState("default");

  const [selectedCalendarCar, setSelectedCalendarCar] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const abortControllerRef = useRef(null);
  const base = "http://localhost:5000";
  // const limit = 12;
  const limit = 100;
  const fallbackImage = `${base}/uploads/default-car.png`;

  useEffect(() => {
    fetchCars();
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {
        }
      }
    };
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError("");
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) { }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await axios.get(`${base}/api/cars`, {
        // params: { limit },
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      const json = res.data;
      setCars(Array.isArray(json.data) ? json.data : json.data ?? json);
    } catch (err) {
      const isCanceled =
        err?.code === "ERR_CANCELED" ||
        (axios.isCancel && axios.isCancel(err)) ||
        err?.name === "CanceledError";
      if (isCanceled) return;

      console.error("Failed to fetch cars:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load cars"
      );
    } finally {
      setLoading(false);
    }
  };

  const buildImageSrc = (image) => {
    if (!image) return "";
    if (Array.isArray(image)) image = image[0];
    if (typeof image !== "string") return "";

    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `${base}${trimmed}`;
    }
    return `${base}/uploads/${trimmed}`;
  };

  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    // prevent infinite loop if fallback also fails
    img.onerror = null;
    img.src = fallbackImage;
    img.alt = img.alt || "Hình ảnh không khả dụng";
    img.style.objectFit = img.style.objectFit || "cover";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const opts =
        d.getFullYear() === now.getFullYear()
          ? { day: "numeric", month: "short" }
          : { day: "numeric", month: "short", year: "numeric" };
      return new Intl.DateTimeFormat("en-IN", opts).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatDateVi = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getNormalizedBookings = (car) => {
    if (!Array.isArray(car?.bookings)) return [];

    return car.bookings
      .map((b) => {
        const startRaw = b.pickupDate ?? b.startDate ?? b.start ?? b.from;
        const endRaw = b.returnDate ?? b.endDate ?? b.end ?? b.to;

        if (!startRaw || !endRaw) return null;

        const start = startOfDay(startRaw);
        const end = startOfDay(endRaw);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

        return {
          start,
          end,
          raw: b,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
  };

  const getCurrentBooking = (car) => {
    const today = startOfDay(new Date());
    const bookings = getNormalizedBookings(car);

    return (
      bookings.find(
        (b) => startOfDay(b.start) <= today && today <= startOfDay(b.end)
      ) || null
    );
  };

  const getNextAvailableDate = (car) => {
    const bookings = getNormalizedBookings(car);
    if (!bookings.length) return null;

    const today = startOfDay(new Date());

    const current = bookings.find(
      (b) => startOfDay(b.start) <= today && today <= startOfDay(b.end)
    );

    if (current) {
      const nextDate = new Date(current.end);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    }

    const futureBookings = bookings.filter((b) => b.start >= today);
    if (futureBookings.length === 0) return today;

    return today;
  };

  const isDateBooked = (date, car) => {
    const target = startOfDay(date);
    const bookings = getNormalizedBookings(car);

    return bookings.some(
      (b) => startOfDay(b.start) <= target && target <= startOfDay(b.end)
    );
  };

  const getCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekday = (firstDay.getDay() + 6) % 7; // Thứ 2 = 0
    const totalDays = lastDay.getDate();

    const days = [];

    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const plural = (n, singular, pluralForm) => {
    if (n === 1) return `1 ${singular}`;
    return `${n} ${pluralForm ?? singular + "s"}`;
  };

  // Compute canonical availability:
  // - prefer car.bookings (if present): find any booking that covers today -> booked until booking.return
  // - otherwise fallback to car.availability provided by backend
  const computeEffectiveAvailability = (car) => {
    const today = new Date();

    if (Array.isArray(car.bookings) && car.bookings.length) {
      const overlapping = car.bookings
        .map((b) => {
          const pickup = b.pickupDate ?? b.startDate ?? b.start ?? b.from;
          const ret = b.returnDate ?? b.endDate ?? b.end ?? b.to;
          if (!pickup || !ret) return null;
          return { pickup: new Date(pickup), return: new Date(ret), raw: b };
        })
        .filter(Boolean)
        .filter(
          (b) =>
            startOfDay(b.pickup) <= startOfDay(today) &&
            startOfDay(today) <= startOfDay(b.return)
        );

      if (overlapping.length > 0) {
        overlapping.sort((a, b) => b.return - a.return);
        return {
          state: "booked",
          until: overlapping[0].return.toISOString(),
          source: "bookings",
        };
      }
    }

    if (car.availability) {
      if (car.availability.state === "booked" && car.availability.until) {
        return {
          state: "booked",
          until: car.availability.until,
          source: "availability",
        };
      }

      if (
        car.availability.state === "available_until_reservation" &&
        Number(car.availability.daysAvailable ?? -1) === 0
      ) {
        // reservation starts today -> treat as booked
        return {
          state: "booked",
          until: car.availability.until ?? null,
          source: "availability-res-starts-today",
          nextBookingStarts: car.availability.nextBookingStarts,
        };
      }

      return { ...car.availability, source: "availability" };
    }

    return { state: "fully_available", source: "none" };
  };

  const renderAvailabilityBadge = (car) => {
    const effective = computeEffectiveAvailability(car);
    const isBooked = effective?.state === "booked";

    return (
      <div
        className={`absolute right-4 top-4 z-20 rounded-full px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-sm whitespace-nowrap ${isBooked
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
          }`}
      >
        {isBooked ? "Đã được đặt" : "Có sẵn"}
      </div>
    );
  };

  const isBookDisabled = (car) => {
    const effective = computeEffectiveAvailability(car);
    if (car?.status && car.status !== "available") return true;
    if (!effective) return false;
    return effective.state === "booked";
  };

  const handleBook = (car, id) => {
    const disabled = isBookDisabled(car);
    if (disabled) return;
    navigate(`/cars/${id}`, { state: { car } });
  };

  // const seatOptions = Array.from(
  //   new Set(
  //     cars
  //       .map((car) => String(car.seats ?? "").trim())
  //       .filter(Boolean)
  //   )
  // ).sort((a, b) => Number(a) - Number(b));

  const seatOptions = ["2", "4", "5", "6", "7", "8"];

  // const categoryOptions = Array.from(
  //   new Set(
  //     cars
  //       .map((car) => String(car.category ?? car.type ?? "").trim())
  //       .filter(Boolean)
  //   )
  // ).sort((a, b) => a.localeCompare(b));

  const categoryOptions = ["Sedan", "SUV", "Sports", "Coupe", "Hatchback", "Luxury"];

  const filteredCars = [...cars]
    .filter((car) => {
      const carName = `${car.make || car.name || ""} ${car.model || ""}`.trim().toLowerCase();

      const matchesSearch =
        !searchTerm.trim() || carName.includes(searchTerm.trim().toLowerCase());

      const matchesSeats =
        seatFilter === "all" || String(car.seats ?? "") === String(seatFilter);

      const matchesCategory =
        categoryFilter === "all" ||
        String(car.category ?? car.type ?? "").trim().toLowerCase() === categoryFilter.toLowerCase();

      const isAvailable = !isBookDisabled(car);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && isAvailable) ||
        (availabilityFilter === "unavailable" && !isAvailable);

      return matchesSearch && matchesSeats && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      const priceA = Number(a.dailyRate ?? a.price ?? a.pricePerDay ?? 0);
      const priceB = Number(b.dailyRate ?? b.price ?? b.pricePerDay ?? 0);

      if (sortPrice === "lowToHigh") return priceA - priceB;
      if (sortPrice === "highToLow") return priceB - priceA;
      return 0;
    });

  return (
    <div className={carPageStyles.pageContainer}>
      {/* Main Content */}
      <div className={carPageStyles.contentContainer}>
        <div className={carPageStyles.headerContainer}>
          <div className={carPageStyles.headerDecoration}></div>
          <h1 className={carPageStyles.title}>Khám Phá Các Mẫu Xe</h1>
          <p className={carPageStyles.subtitle}>
            Khám phá các mẫu xe cho thuê với nhiều lựa chọn khác nhau, luôn sẵn sàng phục vụ cho chuyến đi của bạn.
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto mb-8">
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên xe..."
              className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-4 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <select
              value={sortPrice}
              onChange={(e) => setSortPrice(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-4 text-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="default">Sắp xếp giá</option>
              <option value="lowToHigh">Giá từ thấp đến cao</option>
              <option value="highToLow">Giá từ cao đến thấp</option>
            </select>

            <select
              value={seatFilter}
              onChange={(e) => setSeatFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-4 text-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả số chỗ</option>
              {seatOptions.map((seat) => (
                <option key={seat} value={seat}>
                  {seat} chỗ
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-4 text-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả loại xe</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-4 text-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Book được</option>
              <option value="unavailable">Không book được</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className={carPageStyles.gridContainer}>
          {loading &&
            // show skeleton placeholders when loading
            Array.from({ length: limit }).map((_, i) => (
              <div key={`skeleton-${i}`} className={carPageStyles.carCard}>
                <div className={carPageStyles.glowEffect}></div>
                <div className={carPageStyles.imageContainer}>
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                </div>
                <div className={carPageStyles.cardContent}>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded mt-4 animate-pulse" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="col-span-full text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && filteredCars.length === 0 && (
            <div className="text-center text-slate-300 py-10">
              Không tìm thấy xe phù hợp.
            </div>
          )}

          {/* {!loading &&
            cars.map((car, idx) => { */}
          {!loading && filteredCars.map((car, idx) => {
            const id = car._id ?? car.id ?? idx;
            const carName =
              `${car.make || car.name || ""} ${car.model || ""}`.trim() ||
              car.name ||
              "Chưa có tên xe";
            const imageSrc = buildImageSrc(car.image) || fallbackImage;
            const disabled = isBookDisabled(car);

            return (
              <div key={id} className={carPageStyles.carCard}>
                <div className={carPageStyles.glowEffect}></div>

                <div className={carPageStyles.imageContainer}>
                  <div className="absolute inset-0 z-10" />
                  <img
                    src={imageSrc}
                    alt={carName}
                    onError={handleImageError}
                    className={carPageStyles.carImage}
                  />

                  {/* availability badge at top-right of card */}
                  {disabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCalendarCar(car);
                        setCalendarMonth(
                          new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        );
                      }}
                      className="absolute left-4 top-4 z-20 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 shadow-md backdrop-blur-sm whitespace-nowrap transition hover:bg-orange-200 cursor-pointer"
                    >
                      Xem lịch trống
                    </button>
                  )}

                  {renderAvailabilityBadge(car)}

                  <div className={carPageStyles.priceBadge}>
                    {formatVND(getDailyRate(car), true)}
                  </div>
                </div>

                <div className={carPageStyles.cardContent}>
                  <div className={carPageStyles.headerRow}>
                    <div className="w-full min-w-0">
                      <h3 className={`${carPageStyles.carName} block w-full min-w-0 overflow-hidden whitespace-nowrap text-ellipsis`}>
                        {carName}
                      </h3>
                      <p className={carPageStyles.carType}>
                        {car.category ?? car.type ?? "Sedan"}
                      </p>
                    </div>
                  </div>

                  <div className={carPageStyles.specsGrid}>
                    <div className={carPageStyles.specItem}>
                      <div className={carPageStyles.specIconContainer}>
                        <FaUserFriends className="text-sky-400" />
                      </div>
                      <span>{car.seats ?? "4"} Chỗ</span>
                    </div>

                    <div className={carPageStyles.specItem}>
                      <div className={carPageStyles.specIconContainer}>
                        <FaGasPump className="text-amber-400" />
                      </div>
                      <span>{car.fuelType ?? car.fuel ?? "Xăng"}</span>
                    </div>

                    <div className={carPageStyles.specItem}>
                      <div className={carPageStyles.specIconContainer}>
                        <FaTachometerAlt className="text-emerald-400" />
                      </div>
                      <span>{car.mileage ? `${car.mileage} kmpl` : "—"}</span>
                    </div>

                    <div className={carPageStyles.specItem}>
                      <div className={carPageStyles.specIconContainer}>
                        <FaShieldAlt className="text-purple-400" />
                      </div>
                      <span>Premium</span>
                    </div>
                  </div>

                  {disabled ? (
                    <div className="mt-6">
                      <div className="w-full rounded-2xl bg-red-500/15 px-4 py-3 text-center text-sm font-semibold text-red-400 border border-red-500/30">
                        Đã được đặt
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBook(car, id)}
                      className={carPageStyles.bookButton}
                      aria-label={`Đặt ${carName}`}
                      title={`Đặt ${carName}`}
                    >
                      Đặt ngay
                      <FaArrowRight />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedCalendarCar && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Lịch trống của xe {`${selectedCalendarCar.make || selectedCalendarCar.name || ""} ${selectedCalendarCar.model || ""}`.trim()}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Các ngày tô đỏ là ngày xe đã có lịch đặt.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCalendarCar(null)}
                  className="rounded-full border border-white/10 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaChevronLeft />
                    Tháng trước
                  </span>
                </button>

                <div className="text-lg font-semibold text-orange-400">
                  {new Intl.DateTimeFormat("vi-VN", {
                    month: "long",
                    year: "numeric",
                  }).format(calendarMonth)}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2">
                    Tháng sau
                    <FaChevronRight />
                  </span>
                </button>
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-400">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays(calendarMonth).map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-12 rounded-xl bg-transparent" />;
                  }

                  const booked = isDateBooked(day, selectedCalendarCar);
                  const isToday =
                    startOfDay(day).getTime() === startOfDay(new Date()).getTime();

                  return (
                    <div
                      key={day.toISOString()}
                      className={`flex h-12 items-center justify-center rounded-xl border text-sm font-medium ${booked
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-slate-800 text-slate-200"
                        } ${isToday ? "ring-2 ring-orange-400" : ""}`}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-800/70 p-4">
                {(() => {
                  const currentBooking = getCurrentBooking(selectedCalendarCar);
                  const nextAvailableDate = getNextAvailableDate(selectedCalendarCar);

                  return (
                    <div className="space-y-2 text-sm text-slate-200">
                      <p>
                        {currentBooking ? (
                          <>
                            Xe này hiện đã được đặt từ{" "}
                            <span className="font-semibold text-red-300">
                              {formatDateVi(currentBooking.start)}
                            </span>{" "}
                            đến{" "}
                            <span className="font-semibold text-red-300">
                              {formatDateVi(currentBooking.end)}
                            </span>.
                          </>
                        ) : (
                          <>Xe hiện chưa có lịch đặt trùng với ngày hôm nay.</>
                        )}
                      </p>

                      <p>
                        {nextAvailableDate ? (
                          <>
                            Bạn có thể đặt xe sớm nhất từ ngày{" "}
                            <span className="font-semibold text-green-300">
                              {formatDateVi(nextAvailableDate)}
                            </span>.
                          </>
                        ) : (
                          <>Xe hiện đang có sẵn để đặt.</>
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Floating decorative elements */}
        <div className={carPageStyles.decor1}></div>
        <div className={carPageStyles.decor2}></div>
      </div>
    </div>
  );
};

export default Cars;