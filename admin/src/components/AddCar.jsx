import React, { useCallback, useRef, useState } from 'react'
import { AddCarPageStyles, toastStyles } from "../assets/dummyStyles";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';

const baseURL = "http://localhost:5000";
const api = axios.create({ baseURL });

const AddCar = () => {

    const initialFormData = {
        carName: "",
        dailyPrice: "",
        seats: "",
        fuelType: "Xăng",
        mileage: "",
        transmission: "Số tự động",
        year: "",
        model: "",
        description: "",
        category: "Sedan",
        images: [],
        imagePreviews: [],
    };

    const [data, setData] = useState(initialFormData);
    const fileRef = useRef(null);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === "dailyPrice") {
            const onlyDigits = value.replace(/\D/g, "");
            setData((prev) => ({
                ...prev,
                [name]: onlyDigits,
            }));
            return;
        }

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleImageChange = useCallback((e) => {
        const newFiles = Array.from(e.target.files || []);
        if (!newFiles.length) return;

        setData((prev) => {
            const currentImages = Array.isArray(prev.images) ? prev.images : [];
            const currentPreviews = Array.isArray(prev.imagePreviews) ? prev.imagePreviews : [];

            const remainingSlots = 8 - currentImages.length;
            if (remainingSlots <= 0) return prev;

            const filesToAdd = newFiles.slice(0, remainingSlots);
            const previewsToAdd = filesToAdd.map((file) => URL.createObjectURL(file));

            return {
                ...prev,
                images: [...currentImages, ...filesToAdd],
                imagePreviews: [...currentPreviews, ...previewsToAdd],
            };
        });

        if (fileRef.current) {
            fileRef.current.value = "";
        }
    }, []);

    const resetForm = useCallback(() => {
        setData(initialFormData);
        if (fileRef.current) fileRef.current.value = "";
    }, []);

    const showToast = useCallback((type, title, message, icon) => {
        const toastConfig = {
            position: "top-right",
            className: toastStyles[type].container,
            bodyClassName: toastStyles[type].body,
        };

        if (type === "success") {
            toastConfig.autoClose = 3000;
        } else {
            toastConfig.autoClose = 4000;
        }

        toast[type](
            <div className="flex items-center">
                {icon}
                <div>
                    <p
                        className={
                            type === "success" ? "font-bold text-lg" : "font-semibold"
                        }
                    >
                        {title}
                    </p>
                    <p>{message}</p>
                </div>
            </div>,
            toastConfig
        );
    }, []);

    //HANDLE SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        const carNameForToast = data.carName || "";

        try {
            const formData = new FormData();
            const fieldMappings = {
                make: data.carName,
                dailyRate: data.dailyPrice,
                seats: data.seats,
                fuelType: data.fuelType,
                mileage: data.mileage,
                transmission: data.transmission,
                year: data.year,
                model: data.model,
                description: data.description || "",
                color: "",
                category: data.category,
            };

            Object.entries(fieldMappings).forEach(([key, value]) => {
                formData.append(key, value);
            });

            data.images.forEach((file) => {
                formData.append("images", file);
            });

            await api.post("/api/cars", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            showToast(
                "success",
                "Thành công!",
                `Xe ${carNameForToast} đã được thêm thành công`,
                <svg
                    className={AddCarPageStyles.iconLarge}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
            );

            resetForm();
        } catch (err) {
            console.error("Failed to submit car:", err);
            const msg =
                err.response?.data?.message || err.message || "Failed to list car";

            showToast(
                "error",
                "Error",
                msg,
                <svg
                    className={AddCarPageStyles.iconMedium}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            );
        }
    };

    const renderInputField = (field) => (
        <div key={field.name}>
            <label
                className={
                    field.icon ? AddCarPageStyles.labelWithIcon : AddCarPageStyles.label
                }
            >
                {field.icon}
                {field.label}
            </label>

            <input
                required={field.required}
                name={field.name}
                value={data[field.name]}
                onChange={handleChange}
                type={field.type || 'text'}
                className={
                    field.prefix
                        ? AddCarPageStyles.inputWithPrefix
                        : AddCarPageStyles.input
                }
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                {...field.props}
            />
        </div>
    );

    const renderSelectField = (field) => (
        <div key={field.name}>
            <label className={AddCarPageStyles.label}>{field.label}</label>
            <select
                required={field.required}
                name={field.name}
                value={data[field.name]}
                onChange={handleChange}
                className={AddCarPageStyles.select}
            >
                {field.options.map((option) =>
                    typeof option === "object" ? (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ) : (
                        <option value={option} key={option}>
                            {option}
                        </option>
                    )
                )}
            </select>
        </div>
    );

    const leftColumnFields = [
        {
            type: "input",
            config: {
                name: "carName",
                label: "Tên xe",
                required: true,
                placeholder: "VD: Toyota Camry",
                icon: (
                    <svg
                        className={AddCarPageStyles.iconSmall}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                ),
            },
        },

        {
            type: "input",
            config: {
                name: "dailyPrice",
                label: "Giá thuê mỗi ngày (đ)",
                type: "text",
                required: true,
                placeholder: "100.000",
                props: { className: "pl-8" },
                prefix: <span className="absolute left-3 top-3 text-gray-400">đ</span>,
            },
        },
        {
            type: "select",
            config: {
                name: "seats",
                label: "Số chỗ",
                required: true,
                options: [2, 4, 5, 6, 7, 8].map((n) => ({
                    value: n,
                    label: `${n} chỗ`,
                })),
            },
        },
        {
            type: "select",
            config: {
                name: "fuelType",
                label: "Loại nhiên liệu",
                required: true,
                options: ["Xăng", "Dầu", "Điện", "Hybrid"],
            },
        },
        {
            type: "input",
            config: {
                name: "mileage",
                label: "Mức tiêu hao nhiên liệu (MPG)",
                type: "number",
                required: true,
                min: "1",
                placeholder: "28",
            },
        },
        {
            type: "select",
            config: {
                name: "category",
                label: "Loại xe",
                required: true,
                options: ["Sedan", "SUV", "Sports", "Coupe", "Hatchback", "Luxury"],
            },
        },
    ];

    const rightColumnFields = [
        {
            type: "input",
            config: {
                name: "year",
                label: "Năm sản xuất",
                type: "number",
                required: true,
                min: "1990",
                max: new Date().getFullYear(),
                placeholder: "2020",
            },
        },
        {
            type: "input",
            config: {
                name: "model",
                label: "Phiên bản",
                required: true,
                placeholder: "VD: 2.5Q",
            },
        },
    ];


    return (
        <div className={AddCarPageStyles.pageContainer}>
            <div className={AddCarPageStyles.fixedBackground}>
                <div className={AddCarPageStyles.gradientBlob1}></div>
                <div className={AddCarPageStyles.gradientBlob2}></div>
                <div className={AddCarPageStyles.gradientBlob3}></div>
            </div>

            <div className={AddCarPageStyles.headerContainer}>
                <div className={AddCarPageStyles.headerDivider}>
                    <div className={AddCarPageStyles.headerDividerLine}></div>
                </div>

                <h1 className={AddCarPageStyles.title}>
                    <span className={AddCarPageStyles.titleGradient}>Thêm Xe Của Bạn</span>
                </h1>

                <p className={AddCarPageStyles.subtitle}>
                    Chia sẻ xe của bạn với mọi người và bắt đầu kiếm tiền ngay hôm nay
                </p>
            </div>

            <div className={AddCarPageStyles.formContainer}>
                <form onSubmit={handleSubmit} className={AddCarPageStyles.form}>
                    <div className={AddCarPageStyles.formGrid}>
                        <div className={AddCarPageStyles.formColumn}>
                            {leftColumnFields.map((field) => {
                                if (field.type === "input") {
                                    return (
                                        <div key={field.config.name}>
                                            <label className={AddCarPageStyles.label}>
                                                {field.config.label}
                                            </label>

                                            <div className="relative">
                                                {field.config.prefix}

                                                <input
                                                    required={field.config.required}
                                                    name={field.config.name}
                                                    // value={data[field.config.name]}
                                                    value={
                                                        field.config.name === "dailyPrice"
                                                            ? (Number(data.dailyPrice || 0) || "").toLocaleString("vi-VN")
                                                            : data[field.config.name]
                                                    }
                                                    onChange={handleChange}
                                                    type={field.config.type || "text"}
                                                    className={`${AddCarPageStyles.input} ${field.config.props?.className || ""
                                                        }`}
                                                    placeholder={field.config.placeholder}
                                                    min={field.config.min}
                                                    max={field.config.max}
                                                />
                                            </div>
                                        </div>
                                    );
                                } else if (field.type === "select") {
                                    return renderSelectField(field.config);
                                }
                                return null;
                            })}
                            <div>
                                <label className={AddCarPageStyles.label}>Hộp số</label>
                                <div className={AddCarPageStyles.radioContainer}>
                                    {['Số tự động', 'Số sàn'].map((t) => (
                                        <label
                                            key={t}
                                            className={AddCarPageStyles.radioLabel(
                                                data.transmission === t
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="transmission"
                                                value={t}
                                                checked={data.transmission === t}
                                                onChange={handleChange}
                                                className={AddCarPageStyles.radioInput}
                                            />
                                            <span className={AddCarPageStyles.radioText}>{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={AddCarPageStyles.formColumn}>
                            <div className={AddCarPageStyles.formGridInner}>
                                {rightColumnFields.map((field) => {
                                    if (field.type === "input") {
                                        return renderInputField(field.config);
                                    }
                                    return null;
                                })}
                            </div>

                            <div>
                                <label className={AddCarPageStyles.label}>Hình ảnh xe</label>
                                <div className={`${AddCarPageStyles.imageUploadContainer} flex flex-col`}>
                                    <label className={`${AddCarPageStyles.imageUploadLabel} w-full`}>
                                        {data.imagePreview ? (
                                            <div className="w-full h-full rounded-xl overflow-hidden">
                                                <img
                                                    src={data.imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className={AddCarPageStyles.imageUploadPlaceholder}>
                                                <svg
                                                    className={AddCarPageStyles.iconUpload}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    ></path>
                                                </svg>
                                                <p className={AddCarPageStyles.imageUploadText}>
                                                    <span className={AddCarPageStyles.imageUploadTextSemibold}>
                                                        Nhấn để tải ảnh lên
                                                    </span>
                                                    <br />
                                                    hoặc kéo và thả vào đây
                                                </p>

                                                <p className={AddCarPageStyles.imageUploadSubText}>
                                                    PNG, JPG tối đa 5MB
                                                </p>
                                            </div>
                                        )}

                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden border-radius"
                                        />

                                    </label>
                                    {data.imagePreviews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-4 gap-3">
                                            {data.imagePreviews.slice(0, 8).map((src, index) => (
                                                <div
                                                    key={index}
                                                    className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-800"
                                                >
                                                    <img
                                                        src={src}
                                                        alt={`preview-${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className={AddCarPageStyles.label}>Mô tả</label>
                                <textarea
                                    required
                                    name="description"
                                    value={data.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className={AddCarPageStyles.textarea}
                                    placeholder="Mô tả đặc điểm, tình trạng và các chi tiết đặc biệt của xe..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button type="submit" className={AddCarPageStyles.submitButton}>
                            <span className={AddCarPageStyles.buttonText}>Thêm Xe Ngay</span>
                            <svg
                                className={AddCarPageStyles.iconInline}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                pauseOnFocusLoss
                theme="dark"
            />
        </div>
    )
}

export default AddCar