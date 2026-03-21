import React, { useRef, useState, useEffect } from "react";
import { navbarStyles as s } from "../assets/dummyStyles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logocar.png";
import {
    CalendarCheck,
    Car,
    PlusCircle,
    BarChart3,
    Menu,
    X,
    LogOut,
} from 'lucide-react';

const ADMIN_STORAGE_KEY = "admin_authenticated";

const navLinks = [
    { path: "/", icon: PlusCircle, label: "Thêm xe" },
    { path: "/manage-cars", icon: Car, label: "Quản lý xe" },
    { path: "/bookings", icon: CalendarCheck, label: "Đơn đặt xe" },
    { path: "/statistics", icon: BarChart3, label: "Thống kê" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // useEffect(() => {
    //     const onScroll = () => setScrolled(window.scrollY > 10);
    //     window.addEventListener('scroll', onScroll);
    //     return () => window.removeEventListener('scroll', onScroll);
    // }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const onDocClick = (e) => {
            if (
                isOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(e.target) &&
                !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [isOpen]);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        navigate("/login", { replace: true });
    };

    return (
        // <div className={s.navbar(scrolled)}>
        <div className={`${s.navbar(scrolled)} ${scrolled ? "backdrop-blur-md" : ""}`}>
            <div className={s.navbarInner}>
                <div className={s.navbarCenter}>
                    <div className={s.navbarBackground(scrolled)}>
                        <div className={s.contentContainer}>
                            <Link to="/" className={s.logoLink}>
                                <div className={s.logoContainer}>
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className={s.logoImage}
                                        style={{
                                            objectFit: "contain",
                                        }}
                                    />
                                    <span className={s.logoText}>ADMIN</span>
                                </div>
                            </Link>

                            <div className={s.desktopNav}>
                                <div className={s.navLinksContainer}>
                                    {navLinks.map((link, i) => {
                                        const Icon = link.icon;

                                        return (
                                            <React.Fragment key={link.path}>
                                                <Link to={link.path} className={s.navLink}>
                                                    <Icon className="w-4 h-4" />
                                                    <span>{link.label}</span>
                                                </Link>

                                                {i < navLinks.length - 1 && (
                                                    <div className={s.navDivider} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-2 hover:text-red-500 transition cursor-pointer"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Đăng xuất</span>
                            </button>

                            <div className={s.mobileMenuButton}>
                                <button
                                    ref={buttonRef}
                                    onClick={() => setIsOpen((v) => !v)}
                                    className={s.menuButton}
                                    aria-label="Toggle Menu"
                                    aria-expanded={isOpen}
                                >
                                    {isOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={s.mobileMenu}
                >
                    <div className={s.mobileMenuContainer}>
                        {navLinks.map((link) => {
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={s.mobileNavLink}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 text-left text-slate-700 font-semibold hover:text-red-500 transition"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;