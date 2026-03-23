import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { signupStyles } from '../assets/dummyStyles';
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
  FaImages,
  FaInfoCircle,
  FaShieldAlt
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
  img.alt = img.alt || "Hình ảnh không khả dụng";
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
    return <div className="p-6 text-white">Đang tải thông tin xe...</div>;
  if (!car && carError)
    return <div className="p-6 text-red-400">{carError}</div>;
  if (!car) return <div className="p-6 text-white">Không tìm thấy xe.</div>;

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

      const res = await api.post(
        `/api/bookings`,
        payload,
        { headers, signal: controller.signal }
      );

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

      navigate("/bookings", {
        state: {
          bookingSuccess: true,
          bookingMessage:
            "Đặt xe thành công! Vui lòng vào Đơn đặt xe của tôi để theo dõi.",
        },
      });
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
        "Đặt xe thất bại";
      toast.error(String(serverMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const transmissionLabel = car.transmission
    ? String(car.transmission).trim()
    : "Số tự động";

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
            <div className={`${carDetailStyles.imageCarousel} relative`}>
              <img
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
            </div>

            <h1 className={carDetailStyles.carName}>{car.make}</h1>
            <p className={carDetailStyles.carPrice}>
              {formatVND(price, true)}
            </p>

            <div className={carDetailStyles.specsGrid}>
              {[
                {
                  Icon: FaUserFriends,
                  label: "Số chỗ",
                  value: car.seats ?? "—",
                  color: "text-orange-400",
                },
                {
                  Icon: FaGasPump,
                  label: "Nhiên liệu",
                  value: car.fuel ?? car.fuelType ?? "—",
                  color: "text-green-400",
                },
                {
                  Icon: FaTachometerAlt,
                  label: "Mức tiêu hao",
                  value: car.mileage ? `${car.mileage} kmpl` : "—",
                  color: "text-yellow-400",
                },
                {
                  Icon: FaCheckCircle,
                  label: "Hộp số",
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
              <h2 className={carDetailStyles.aboutTitle}>Thông Tin Xe</h2>
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

            <div className={carDetailStyles.aboutSection}>
              <h2 className={carDetailStyles.aboutTitle}>Điều Khoản</h2>
              <div className="flex items-center mb-1">
                <FaInfoCircle className="text-blue-400 mr-2 text-sm" />
                <span className={carDetailStyles.aboutText}>
                  Thanh toán tiền thuê ngay khi bàn giao xe
                </span>
              </div>
              <div className="flex items-center">
                <FaInfoCircle className="text-blue-400 mr-2 text-sm" />
                <span className={carDetailStyles.aboutText}>
                  Quy định khác:
                </span>
              </div>
              <div className="mt-2 gap-3">
                <div className="flex items-center">
                  <ul className="text-gray-300 text-sm">
                    <li>- Sử dụng xe đúng mục đích.</li>
                    <li>- Không sử dụng xe thuê vào mục đích phi pháp, trái pháp luật.</li>
                    <li>- Không sử dụng xe thuê để cầm cố, thế chấp.</li>
                    <li>- Không hút thuốc, nhả kẹo cao su, xả rác trong xe.</li>
                    <li>- Không chở hàng quốc cấm dễ cháy nổ.</li>
                    <li>- Không chở hoa quả, thực phẩm nặng mùi trong xe.</li>
                    <li>- Khi trả xe, nếu xe bẩn hoặc có mùi trong xe, khách hàng vui lòng vệ sinh xe sạch sẽ hoặc gửi phụ thu phí vệ sinh xe.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={carDetailStyles.aboutSection}>
              <h2 className={carDetailStyles.aboutTitle}>Tài Sản Thế Chấp</h2>
              <div className="flex items-center mb-1">
                <FaShieldAlt className="text-yellow-400 mr-2 text-sm" />
                <span className={carDetailStyles.aboutText}>
                  Tài sản thế chấp:
                </span>
              </div>
              <div className="mt-2 gap-3">
                <div className="flex items-center">
                  <ul className="text-gray-300 text-sm">
                    <li>- Khách hàng vui lòng thế chấp 01 xe máy chính chủ.</li>
                    <li>- Kèm theo giấy tờ xe bản gốc đứng tên chính chủ của khách hàng.</li>
                    <li>- Xe và giấy tờ phải còn hiệu lực, không tranh chấp, không bị cầm cố/thế chấp tại đơn vị khác.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={carDetailStyles.rightColumn}>
            <div className={carDetailStyles.bookingCard}>
              <h2 className={carDetailStyles.bookingTitle}>
                Thông Tin{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                  Đặt Xe
                </span>
              </h2>
              <p className={carDetailStyles.bookingSubtitle}>
                Nhanh · An toàn · Dễ dàng
              </p>

              <form onSubmit={handleSubmit} className={carDetailStyles.form}>
                <div className={carDetailStyles.grid2}>
                  <div className="flex flex-col">
                    <label
                      htmlFor="pickupDate"
                      className={carDetailStyles.formLabel}
                    >
                      Ngày nhận xe
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
                      Ngày trả xe
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
                    Địa điểm nhận xe
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
                      placeholder="Nhập địa điểm nhận xe"
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
                  <label className={carDetailStyles.formLabel}>Họ và tên</label>
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
                      placeholder="Nhập họ và tên"
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
                      Địa chỉ Email
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
                        placeholder="Nhập email"
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
                      Số điện thoại
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
                        placeholder="Nhập số điện thoại"
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
                      Bằng việc đặt xe, bạn đồng ý với các {" "}
                      <Link to="/dieu-khoan-dich-vu" className={signupStyles.form.checkboxLink}>
                        Điều khoản & Điều kiện
                      </Link>
                      {" "}của chúng tôi
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={carDetailStyles.submitButton}
                >
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