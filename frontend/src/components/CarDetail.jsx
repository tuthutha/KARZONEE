import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaGasPump,
  FaTachometerAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCity,
  FaGlobeAsia,
  FaMapPin,
  FaImages
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import carsData from "../assets/carsData";
import { carDetailStyles } from "../assets/dummyStyles";
import { formatVND } from "../utils/formatCurrency.js";

const API_BASE = "http://localhost:5000";
const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
});

const todayISO = () => new Date().toISOString().split("T")[0];

const buildImageSrc = (image) => {
  if (!image) return `${API_BASE}/uploads/default-car.png`;
  if (Array.isArray(image)) image = image[0];
  if (!image || typeof image !== "string")
    return `${API_BASE}/uploads/default-car.png`;
  const t = image.trim();
  if (!t) return `${API_BASE}/uploads/default-car.png`;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${API_BASE}${t}`;
  return `${API_BASE}/uploads/${t}`;
};

const handleImageError = (
  e,
  fallback = `${API_BASE}/uploads/default-car.png`
) => {
  const img = e?.target;
  if (!img) return;
  img.onerror = null;
  img.src = fallback;
  img.onerror = () => {
    img.onerror = null;
    img.src = "https://via.placeholder.com/800x500.png?text=No+Image";
  };
  img.alt = img.alt || "Image not available";
  img.style.objectFit = img.style.objectFit || "cover";
};

const calculateDays = (from, to) => {
  if (!from || !to) return 1;
  const days = Math.ceil(
    (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, days);
};

const CarDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [car, setCar] = useState(() => location.state?.car || null);
  const [loadingCar, setLoadingCar] = useState(false);
  const [carError, setCarError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  // const [formData, setFormData] = useState({
  //   pickupDate: "",
  //   returnDate: "",
  //   pickupLocation: "",
  //   name: "",
  //   email: "",
  //   phone: "",
  //   city: "",
  //   state: "",
  //   zipCode: "",
  // });
  const [formData, setFormData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
    acceptTerms: false,
    pickupAtStore: false,
  });
  const [activeField, setActiveField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fetchControllerRef = useRef(null);
  const submitControllerRef = useRef(null);
  const [today, setToday] = useState(todayISO());

  useEffect(() => setToday(todayISO()), []);

  useEffect(() => {
    if (car) {
      setCurrentImage(0);
      return;
    }

    const local = carsData.find((c) => String(c.id) === String(id));
    if (local) {
      setCar(local);
      setCurrentImage(0);
      return;
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;
    (async () => {
      setLoadingCar(true);
      setCarError("");
      try {
        const res = await api.get(`/api/cars/${id}`, {
          signal: controller.signal,
        });
        const payload = res.data?.data ?? res.data ?? null;
        if (payload) setCar(payload);
        else setCarError("Car not found.");
      } catch (err) {
        const canceled =
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.message === "canceled";
        if (!canceled) {
          console.error("Failed to fetch car:", err);
          setCarError(
            err?.response?.data?.message || err.message || "Failed to load car"
          );
        }
      } finally {
        setLoadingCar(false);
      }
    })();

    return () => {
      try {
        controller.abort();
      } catch { }
      fetchControllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!car && loadingCar)
    return <div className="p-6 text-white">Loading car...</div>;
  if (!car && carError)
    return <div className="p-6 text-red-400">{carError}</div>;
  if (!car) return <div className="p-6 text-white">Car not found.</div>;

  // const carImages = [
  //   ...(Array.isArray(car.images) ? car.images : []),
  //   ...(car.image ? (Array.isArray(car.image) ? car.image : [car.image]) : []),
  // ].filter(Boolean);

  const carImages = Array.isArray(car.images) && car.images.length > 0
    ? car.images
    : car.image
      ? [car.image]
      : [];

  const price = Number(car.price ?? car.dailyRate ?? 0) || 0;
  const days = calculateDays(formData.pickupDate, formData.returnDate);
  const calculateTotal = () => days * price;

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((f) => ({ ...f, [name]: value }));
  // };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupDate || !formData.returnDate) {
      toast.error("Vui lòng chọn ngày nhận xe và ngày trả xe.");
      return;
    }
    if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
      toast.error("Ngày trả xe phải bằng hoặc sau ngày nhận xe.");
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Vui lòng chấp nhận các Điều khoản & Điều kiện");
      return;
    }

    if (!formData.pickupAtStore && !formData.pickupLocation.trim()) {
      toast.error("Vui lòng nhập địa điểm nhận xe.");
      return;
    }

    if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
      toast.error("Ngày trả xe phải bằng hoặc sau ngày nhận xe.");
      return;
    }

    setSubmitting(true);
    if (submitControllerRef.current) {
      try {
        submitControllerRef.current.abort();
      } catch { }
    }
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const token = localStorage.getItem("token");
      // const payload = {
      //   userId,
      //   customer: formData.name,
      //   email: formData.email,
      //   phone: formData.phone,
      //   car: {
      //     id: car._id ?? car.id ?? null,
      //     name: car.name ?? `${car.make ?? ""} ${car.model ?? ""}`.trim(),
      //   },
      //   pickupDate: formData.pickupDate,
      //   returnDate: formData.returnDate,
      //   amount: calculateTotal(),
      //   details: { pickupLocation: formData.pickupLocation },
      //   address: {
      //     city: formData.city,
      //     state: formData.state,
      //     zipCode: formData.zipCode,
      //   },
      //   carImage: car.image
      //     ? buildImageSrc(Array.isArray(car.image) ? car.image[0] : car.image)
      //     : undefined,
      // };

      const payload = {
        userId,
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        car: {
          id: car._id ?? car.id ?? null,
          name: car.name ?? `${car.make ?? ""} ${car.model ?? ""}`.trim(),
        },
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        amount: calculateTotal(),
        pickupAtStore: formData.pickupAtStore,
        acceptTerms: formData.acceptTerms,
        details: {
          pickupLocation: formData.pickupAtStore ? "Nhận xe tại cửa hàng" : formData.pickupLocation,
        },
        address: {
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        carImage: car.image
          ? buildImageSrc(Array.isArray(car.image) ? car.image[0] : car.image)
          : undefined,
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      // const res = await api.post(
      //   `/api/payments/create-checkout-session`,
      //   payload,
      //   {
      //     headers,
      //     signal: controller.signal,
      //   }
      // );

      // const res = await api.post(
      //   `/api/bookings`,
      //   payload,
      //   { headers, signal: controller.signal }
      // );

      // if (res?.data?.url) {
      //   toast.success("Đang chuyển đến trang thanh toán...", {
      //     position: "top-right",
      //     autoClose: 1200,
      //   });
      //   window.location.href = res.data.url;
      //   return;
      // }

      // toast.success(
      //   "Bạn đã đặt xe thành công!",
      //   { position: "top-right", autoClose: 2000 }
      // );
      // setFormData({
      //   pickupDate: "",
      //   returnDate: "",
      //   pickupLocation: "",
      //   name: "",
      //   email: "",
      //   phone: "",
      //   city: "",
      //   state: "",
      //   zipCode: "",
      // });
      // navigate("/bookings");
      const res = await api.post(
        `/api/bookings`,
        payload,
        { headers, signal: controller.signal }
      );

      toast.success("Bạn đã đặt xe thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      setFormData({
        pickupDate: "",
        returnDate: "",
        pickupLocation: "",
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        zipCode: "",
        acceptTerms: false,
        pickupAtStore: false,
      });

      navigate("/bookings");
    } catch (err) {
      const canceled =
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled";
      if (canceled) return;
      console.error("Booking error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Booking failed";
      toast.error(String(serverMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const transmissionLabel = car.transmission
    ? String(car.transmission).toLowerCase()
    : "standard";

  return (
    <div className={carDetailStyles.pageContainer}>
      <div className={carDetailStyles.contentContainer}>
        <ToastContainer />
        <button
          onClick={() => navigate(-1)}
          className={carDetailStyles.backButton}
        >
          <FaArrowLeft className={carDetailStyles.backButtonIcon} />
        </button>

        <div className={carDetailStyles.mainLayout}>
          <div className={carDetailStyles.leftColumn}>
            {/* <div className={carDetailStyles.imageCarousel}> */}
            <div className={`${carDetailStyles.imageCarousel} relative`}>
              <img
                // src={buildImageSrc(carImages[currentImage] ?? car.image)}
                src={buildImageSrc(carImages[currentImage] || car.image)}
                alt={car.name}
                className={carDetailStyles.carImage}
                onError={(e) => handleImageError(e)}
              />

              {carImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="absolute bottom-4 right-4 rounded-2xl bg-white px-4 py-2 text-black font-semibold shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <FaImages />
                  Xem tất cả ảnh
                </button>
              )}

              {/* {(carImages.length > 0 || (car.image && car.image !== "")) && (
                <div className={carDetailStyles.carouselIndicators}>
                  {(carImages.length > 0 ? carImages : [car.image]).map(
                    (_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        aria-label={`Show image ${idx + 1}`}
                        className={carDetailStyles.carouselIndicator(
                          idx === currentImage
                        )}
                      />
                    )
                  )}
                </div>
              )} */}
            </div>

            <h1 className={carDetailStyles.carName}>{car.make}</h1>
            <p className={carDetailStyles.carPrice}>
              {formatVND(price, true)}
            </p>

            <div className={carDetailStyles.specsGrid}>
              {[
                {
                  Icon: FaUserFriends,
                  label: "Seats",
                  value: car.seats ?? "—",
                  color: "text-orange-400",
                },
                {
                  Icon: FaGasPump,
                  label: "Fuel",
                  value: car.fuel ?? car.fuelType ?? "—",
                  color: "text-green-400",
                },
                {
                  Icon: FaTachometerAlt,
                  label: "Mileage",
                  value: car.mileage ? `${car.mileage} kmpl` : "—",
                  color: "text-yellow-400",
                },
                {
                  Icon: FaCheckCircle,
                  label: "Transmission",
                  value: transmissionLabel,
                  color: "text-purple-400",
                },
              ].map((spec, i) => (
                <div key={i} className={carDetailStyles.specCard}>
                  <spec.Icon
                    className={`${spec.color} ${carDetailStyles.specIcon}`}
                  />
                  <p
                    className={
                      carDetailStyles.aboutText +
                      " " +
                      carDetailStyles.specLabel
                    }
                  >
                    {spec.label}
                  </p>
                  <p className={carDetailStyles.specValue}>{spec.value}</p>
                </div>
              ))}
            </div>

            <div className={carDetailStyles.aboutSection}>
              <h2 className={carDetailStyles.aboutTitle}>Thông tin xe</h2>
              {/* <p className={carDetailStyles.aboutText}>
                Experience luxury in the {car.name}. With its{" "}
                {transmissionLabel} transmission and seating for{" "}
                {car.seats ?? "—"}, every journey is exceptional.
              </p> */}
              {/* <p className={carDetailStyles.aboutText}>
                {car.description ??
                  "This car combines performance and comfort for an unforgettable drive."}
              </p> */}
              <p className={carDetailStyles.aboutText}>
                {car.description?.trim() || "Chưa có mô tả cho xe này."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Hủy miễn phí
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Hỗ trợ cứu hộ 24/7
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Không giới hạn quãng đường
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Miễn trừ thiệt hại va chạm (CDW)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={carDetailStyles.rightColumn}>
            <div className={carDetailStyles.bookingCard}>
              <h2 className={carDetailStyles.bookingTitle}>
                Reserve{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                  Your Drive
                </span>
              </h2>
              <p className={carDetailStyles.bookingSubtitle}>
                Fast · Secure · Easy
              </p>

              <form onSubmit={handleSubmit} className={carDetailStyles.form}>
                <div className={carDetailStyles.grid2}>
                  <div className="flex flex-col">
                    <label
                      htmlFor="pickupDate"
                      className={carDetailStyles.formLabel}
                    >
                      Pickup Date
                    </label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "pickupDate"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaCalendarAlt />
                      </div>
                      <input
                        id="pickupDate"
                        type="date"
                        name="pickupDate"
                        min={today}
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("pickupDate")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.inputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="returnDate"
                      className={carDetailStyles.formLabel}
                    >
                      Return Date
                    </label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "returnDate"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaCalendarAlt />
                      </div>
                      <input
                        id="returnDate"
                        type="date"
                        name="returnDate"
                        min={formData.pickupDate || today}
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("returnDate")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.inputField}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={carDetailStyles.formLabel}>
                    Pickup Location
                  </label>
                  <div
                    className={carDetailStyles.inputContainer(
                      activeField === "pickupLocation"
                    )}
                  >
                    <div className={carDetailStyles.inputIcon}>
                      <FaMapMarkerAlt />
                    </div>
                    <input
                      type="text"
                      name="pickupLocation"
                      placeholder="Enter pickup location"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("pickupLocation")}
                      onBlur={() => setActiveField(null)}
                      required
                      className={carDetailStyles.textInputField}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={carDetailStyles.formLabel}>Full Name</label>
                  <div
                    className={carDetailStyles.inputContainer(
                      activeField === "name"
                    )}
                  >
                    <div className={carDetailStyles.inputIcon}>
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("name")}
                      onBlur={() => setActiveField(null)}
                      required
                      className={carDetailStyles.textInputField}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>
                      Email Address
                    </label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "email"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("email")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>
                      Phone Number
                    </label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "phone"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaPhone />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("phone")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>Tỉnh / Thành phố</label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "city"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaCity />
                      </div>
                      <input
                        type="text"
                        name="city"
                        placeholder="Nhập tỉnh / thành phố"
                        value={formData.city}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("city")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>Phường / Xã</label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "state"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaGlobeAsia />
                      </div>
                      <input
                        type="text"
                        name="state"
                        placeholder="Nhập phường / xã"
                        value={formData.state}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("state")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>
                      Địa chỉ chi tiết
                    </label>
                    <div
                      className={carDetailStyles.inputContainer(
                        activeField === "zipCode"
                      )}
                    >
                      <div className={carDetailStyles.inputIcon}>
                        <FaMapPin />
                      </div>
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="Số nhà, tên đường, ngõ..."
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("zipCode")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>
                </div>

                <div className={carDetailStyles.priceBreakdown}>
                  <div className={carDetailStyles.priceRow}>
                    <span>Giá/ngày {formatVND(price, true)}</span>
                    {/* <span>${price}</span> */}
                  </div>
                  {formData.pickupDate && formData.returnDate && (
                    <div className={carDetailStyles.priceRow}>
                      <span>Days</span>
                      <span>{days}</span>
                    </div>
                  )}
                  <div className={carDetailStyles.totalRow}>
                    <span>Tổng tiền {formatVND(calculateTotal())}</span>
                    {/* <span>${calculateTotal()}</span> */}
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="pickupAtStore"
                      checked={formData.pickupAtStore}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <span>Nhận xe tại cửa hàng</span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <span>
                      Bằng việc đặt xe, bạn đồng ý với các <b>Điều khoản &amp; Điều kiện</b> của chúng tôi
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={carDetailStyles.submitButton}
                >
                  {/* <FaCreditCard className="mr-2 group-hover:scale-110 transition-transform" /> */}
                  {/* <span>
                    {submitting ? "Đang đặt xe..." : "Đặt Xe Ngay"}
                  </span> */}
                  <span
                    type="submit"
                    className={carDetailStyles.submitButton}
                  >
                    {submitting ? "Đang xử lý..." : "Đặt Xe Ngay"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showGallery && carImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 text-white">
            <div className="text-lg font-semibold">
              {currentImage + 1} / {carImages.length}
            </div>

            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="text-3xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <button
              type="button"
              onClick={() =>
                setCurrentImage((prev) =>
                  prev === 0 ? carImages.length - 1 : prev - 1
                )
              }
              className="mr-4 text-white text-4xl"
            >
              ‹
            </button>

            <img
              src={buildImageSrc(carImages[currentImage])}
              alt={`car-${currentImage + 1}`}
              className="max-h-[80vh] max-w-[80vw] object-contain"
            />

            <button
              type="button"
              onClick={() =>
                setCurrentImage((prev) =>
                  prev === carImages.length - 1 ? 0 : prev + 1
                )
              }
              className="ml-4 text-white text-4xl"
            >
              ›
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex gap-3 overflow-x-auto">
              {carImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImage(index)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border ${currentImage === index ? "border-orange-500" : "border-white/20"
                    }`}
                >
                  <img
                    src={buildImageSrc(img)}
                    alt={`thumb-${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetail;