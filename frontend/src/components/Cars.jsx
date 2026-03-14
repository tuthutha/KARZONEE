import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaGasPump,
  FaArrowRight,
  FaTachometerAlt,
  FaUserFriends,
  FaShieldAlt,
} from "react-icons/fa";
import axios from "axios";
import { carPageStyles } from "../assets/dummyStyles";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
// ceil so partial days count as next day
const daysBetween = (from, to) =>
  Math.ceil((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);

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
    img.alt = img.alt || "Image not available";
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

  // Given an 'until' ISO date, compute day-after available date + daysUntilAvailable
  const computeAvailableMeta = (untilIso) => {
    if (!untilIso) return null;
    try {
      const until = new Date(untilIso);
      const available = new Date(until);
      available.setDate(available.getDate() + 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilAvailable = daysBetween(today, available);
      return { availableIso: available.toISOString(), daysUntilAvailable };
    } catch {
      return null;
    }
  };

  // Render availability badge — prefer showing concrete available date when booked
  const renderAvailabilityBadge = (rawAvailability, car) => {
    const effective = computeEffectiveAvailability(car);

    if (!effective) {
      return (
        <span className="px-2 py-1 text-xs rounded-md bg-green-50 text-green-700">
          Available
        </span>
      );
    }

    if (effective.state === "booked") {
      if (effective.until) {
        const meta = computeAvailableMeta(effective.until);
        if (meta && meta.availableIso) {
          return (
            <div className="flex flex-col items-end">
              <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
                Booked — available on {formatDate(meta.availableIso)}
              </span>
              <small className="text-xs text-gray-400 mt-1">
                until {formatDate(effective.until)}
              </small>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-end">
            <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
              Booked
            </span>
            <small className="text-xs text-gray-400 mt-1">
              until {formatDate(effective.until)}
            </small>
          </div>
        );
      }
      // booked but no until info
      return (
        <div className="flex flex-col items-end">
          <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
            Booked
          </span>
        </div>
      );
    }

    if (effective.state === "available_until_reservation") {
      const days = Number(effective.daysAvailable ?? -1);
      if (!Number.isFinite(days) || days < 0) {
        return (
          <div className="flex flex-col items-end">
            <span className="px-2 py-1 text-xs rounded-md bg-amber-50 text-amber-800 font-semibold">
              Available
            </span>
            {effective.nextBookingStarts && (
              <small className="text-xs text-gray-400 mt-1">
                from {formatDate(effective.nextBookingStarts)}
              </small>
            )}
          </div>
        );
      }
      if (days === 0) {
        return (
          <div className="flex flex-col items-end">
            <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
              Booked — starts today
            </span>
            {effective.nextBookingStarts && (
              <small className="text-xs text-gray-400 mt-1">
                from {formatDate(effective.nextBookingStarts)}
              </small>
            )}
          </div>
        );
      }
      return (
        <div className="flex flex-col items-end">
          <span className="px-2 py-1 text-xs rounded-md bg-amber-50 text-amber-800 font-semibold">
            Available — reserved in {plural(days, "day")}
          </span>
          {effective.nextBookingStarts && (
            <small className="text-xs text-gray-400 mt-1">
              from {formatDate(effective.nextBookingStarts)}
            </small>
          )}
        </div>
      );
    }

    // fully_available or fallback
    return (
      <span className="px-2 py-1 text-xs rounded-md bg-green-50 text-green-700">
        Available
      </span>
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

  const seatOptions = Array.from(
    new Set(
      cars
        .map((car) => String(car.seats ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => Number(a) - Number(b));

  const categoryOptions = Array.from(
    new Set(
      cars
        .map((car) => String(car.category ?? car.type ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  // const filteredCars = [...cars]
  //   .filter((car) => {
  //     const carName = `${car.make || car.name || ""} ${car.model || ""}`.trim().toLowerCase();
  //     const matchesSearch =
  //       !searchTerm.trim() || carName.includes(searchTerm.trim().toLowerCase());

  //     const matchesSeats =
  //       seatFilter === "all" || String(car.seats ?? "") === String(seatFilter);

  //     const matchesCategory =
  //       categoryFilter === "all" ||
  //       String(car.category ?? car.type ?? "").toLowerCase() === categoryFilter.toLowerCase();

  //     const effective = computeEffectiveAvailability(car);
  //     const isAvailable = !isBookDisabled(car);

  //     const matchesAvailability =
  //       availabilityFilter === "all" ||
  //       (availabilityFilter === "available" && isAvailable) ||
  //       (availabilityFilter === "unavailable" && !isAvailable);

  //     return matchesSearch && matchesSeats && matchesCategory && matchesAvailability;
  //   })
  //   .sort((a, b) => {
  //     const priceA = Number(a.dailyRate ?? a.price ?? a.pricePerDay ?? 0);
  //     const priceB = Number(b.dailyRate ?? b.price ?? b.pricePerDay ?? 0);

  //     if (sortPrice === "lowToHigh") return priceA - priceB;
  //     if (sortPrice === "highToLow") return priceB - priceA;
  //     return 0;
  //   });

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

        {/* <div className="w-full max-w-5xl mx-auto mb-8"> */}
        {/* <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên xe..."
              className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-4 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div> */}

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
          {/* </div> */}

          {/* <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => setAvailabilityFilter("unavailable")}
              className={`px-6 py-3 rounded-full font-semibold transition ${availabilityFilter === "unavailable"
                ? "bg-orange-500 text-white"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
            >
              Không book được
            </button>
          </div> */}
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

          {/* {!loading && !error && cars.length === 0 && (
            <div className="col-span-full text-center">No cars available.</div>
          )} */}
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
              "Unnamed";
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
                  <div className="absolute right-4 top-4 z-20">
                    {renderAvailabilityBadge(car.availability, car)}
                  </div>

                  <div className={carPageStyles.priceBadge}>
                    ₹{car.dailyRate ?? car.price ?? car.pricePerDay ?? "—"}
                    /day
                  </div>
                </div>

                <div className={carPageStyles.cardContent}>
                  <div className={carPageStyles.headerRow}>
                    <div>
                      <h3 className={carPageStyles.carName}>{carName}</h3>
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
                      <span>{car.seats ?? "4"} Seats</span>
                    </div>

                    <div className={carPageStyles.specItem}>
                      <div className={carPageStyles.specIconContainer}>
                        <FaGasPump className="text-amber-400" />
                      </div>
                      <span>{car.fuelType ?? car.fuel ?? "Gasoline"}</span>
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

                  <button
                    onClick={() => handleBook(car, id)}
                    className={`${carPageStyles.bookButton} ${disabled ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    aria-label={`Book ${carName}`}
                    title={
                      disabled
                        ? "Xe này hiện đang được đặt hoặc không khả dụng."
                        : `Book ${carName}`
                    }
                    disabled={disabled}
                  >
                    <span className={carPageStyles.buttonText}>
                      {disabled ? "Unavailable" : "Book Now"}
                    </span>
                    <FaArrowRight className={carPageStyles.buttonIcon} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating decorative elements */}
        <div className={carPageStyles.decor1}></div>
        <div className={carPageStyles.decor2}></div>
      </div>
    </div>
  );
};

export default Cars;