import React, { useState } from "react";
import { contactPageStyles as styles } from "../assets/dummyStyles";
import { FaClock, FaEnvelope, FaMapMarkedAlt, FaWhatsapp, FaCalendarAlt, FaUser, FaPhone, FaCar, FaComment } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carType: "",
    message: "",
  });

  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  }

  // WHATSAPP API
  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage =
      `Tên: ${formData.name}%0A` +
      `Email: ${formData.email}%0A` +
      `Số điện thoại: ${formData.phone}%0A` +
      `Loại xe: ${formData.carType}%0A` +
      `Nội dung: ${formData.message}`;

    window.open(`https://wa.me/+84392028683?text=${whatsappMessage}`, "_blank");

    setFormData({ name: "", email: "", phone: "", carType: "", message: "" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.diamondPattern}>
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
              linear-gradient(150deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
              linear-gradient(30deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
              linear-gradient(150deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
              linear-gradient(60deg, rgba(234,88,12,0.08) 25%, transparent 25.5%, transparent 75%, rgba(234,88,12,0.08) 75%, rgba(234,88,12,0.08)),
              linear-gradient(60deg, rgba(234,88,12,0.08) 25%, transparent 25.5%, transparent 75%, rgba(234,88,12,0.08) 75%, rgba(234,88,12,0.08))
            `,
            backgroundSize: "80px 140px",
            backgroundPosition:
              "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
          }}
        ></div>
      </div>

      {/* FLOATING PARTICLES */}
      <div className={styles.floatingTriangles}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={styles.triangle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              background:
                i % 3 === 0 ? "#f97316" : i % 3 === 1 ? "#fb923c" : "#fdba74",
              transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5
                })`,
            }}
          ></div>
        ))}
      </div>

      {/* TITLE */}
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Liên Hệ Với Chúng Tôi</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            Nếu bạn có bất kỳ câu hỏi nào về dịch vụ thuê xe, hãy liên hệ với chúng tôi. Đội ngũ KarZone luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardCircle1}></div>
            <div className={styles.infoCardCircle2}></div>

            <div className=" relative z-10 space-y-5">
              <h2 className={styles.infoTitle}>
                <FaMapMarkedAlt className={styles.infoIcon} /> Thông Tin Liên Hệ
              </h2>

              <div className={styles.infoItemContainer}>
                {[
                  {
                    icon: FaWhatsapp,
                    label: 'Whatsapp',
                    value: '+84 392028683',
                    color: 'bg-green-900/30'
                  },
                  {
                    icon: FaEnvelope,
                    label: 'Email',
                    value: 'canvantu68@gmail.com',
                    color: 'bg-orange-900/30'
                  },
                  {
                    icon: FaClock,
                    label: 'Giờ Làm Việc',
                    value: 'Thứ 2-Thứ 7: 8AM-8PM',
                    color: 'bg-orange-900/30'
                  },
                ].map((info, i) => (
                  <div key={i} className={styles.infoItem}>
                    <div className={styles.iconContainer(info.color)}>
                      <info.icon
                        className={
                          i === 0
                            ? "text-green-400 text-lg"
                            : "text-orange-400 text-lg"
                        }
                      />
                    </div>

                    <div>
                      <h3 className={styles.infoLabel}>
                        {info.label}
                      </h3>
                      <p className={styles.infoValue}>
                        {info.value}
                        {i === 2 && <span className="block text-gray-500">
                          Chủ Nhật: 10AM-6PM
                        </span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.offerContainer}>
                <div className="flex items-center">
                  <FaCalendarAlt className={styles.offerIcon} />
                  <span className={styles.offerTitle}>Ưu Đãi Đặc Biệt!</span>
                </div>

                <p className={styles.offerText}>
                  Thuê từ 3 ngày trở lên giảm giá 10%
                </p>
              </div>
            </div>
          </div>

          {/* FORM CARD */}
          <div className={styles.formCard}>
            <div className={styles.formCircle1}></div>
            <div className={styles.formCircle2}></div>

            <div className="mb-4">
              <h2 className={styles.formTitle}>
                <IoIosSend className={styles.infoIcon} />
                Gửi Yêu Cầu
              </h2>
              <p className={styles.formSubtitle}>
                Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                {["name", "email", "phone", "carType"].map((field) => {

                  const icons = {
                    name: FaUser,
                    email: FaEnvelope,
                    phone: FaPhone,
                    carType: FaCar,
                  };

                  const placeholders = {
                    name: "Họ và tên",
                    email: "Email",
                    phone: "Số điện thoại",
                    carType: "Chọn loại xe",
                  };

                  return (
                    <div key={field} className={styles.inputContainer}>
                      <div className={styles.inputIcon}>
                        {React.createElement(icons[field])}
                      </div>

                      {field !== "carType" ? (
                        <input
                          type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          onFocus={() => handleFocus(field)}
                          onBlur={handleBlur}
                          required
                          placeholder={placeholders[field]}
                          className={styles.input(activeField === field)}
                        />
                      ) : (
                        <select
                          name="carType"
                          value={formData.carType}
                          onChange={handleChange}
                          onFocus={handleBlur}
                          required
                          className={styles.select(activeField === field)}
                        >
                          <option value="">Chọn loại xe</option>
                          {[
                            "Economy",
                            "SUV",
                            "Luxury",
                            "Van",
                            "Sports Car",
                            "Convertible",
                          ].map((opt) => (
                            <option
                              value={opt}
                              key={opt}
                              className="bg-gray-800 cursor-pointer"
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="relative">
                <div className={styles.textareaIcon}>
                  <FaComment />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={handleBlur}
                  required
                  rows={3}
                  placeholder="Hãy cho chúng tôi biết nhu cầu thuê xe của bạn..."
                  className={styles.textarea(activeField === 'message')}
                ></textarea>
              </div>

              <button type="submit" className={styles.submitButton}>
                Gửi Tin Nhắn
                <FaWhatsapp className={styles.whatsappIcon} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fade-in Animation */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(10px); }
          to { opacity:1; transform:translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        `}
      </style>
    </div>
  );
};

export default Contact;