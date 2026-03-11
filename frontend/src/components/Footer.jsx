import React from "react";
import { footerStyles as styles } from "../assets/dummyStyles";
import { Link } from "react-router-dom";
import logo from "../assets/logoCar.png";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube, FaMapMarkedAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { GiCarKey } from "react-icons/gi";

const Footer = () => {
    return (
        <footer className={styles.container}>
            <div className={styles.topElements}>
                <div className={styles.circle1} />
                <div className={styles.circle2} />
                <div className={styles.roadLine} />
            </div>

            <div className={styles.innerContainer}>
                <div className={styles.grid}>
                    <div className={styles.brandSection}>
                        <Link to="/" className="flex items-center">
                            <div className={styles.logoContainer}>
                                <img
                                    src={logo}
                                    alt="logo"
                                    className="h-[1em] w-auto block"
                                    style={{
                                        display: "block",
                                        objectFit: "contain",
                                    }}
                                />
                                <span className={styles.logoText}>KARZONE</span>
                            </div>
                        </Link>

                        <p className={styles.description}>
                            Dịch vụ cho thuê xe cao cấp với các mẫu xe mới nhất và dịch vụ khách hàng xuất sắc. Hãy lái chiếc xe mơ ước của bạn ngay hôm nay!
                        </p>

                        <div className={styles.socialIcons}>
                            {[
                                FaFacebook,
                                FaTwitter,
                                FaInstagram,
                                FaLinkedinIn,
                                FaYoutube,
                            ].map((Icon, i) => (
                                <a href="#" key={i} className={styles.socialIcon}>
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h3 className={styles.sectionTitle}>
                            Liên Kết Nhanh
                            <span className={styles.underline} />
                        </h3>

                        <ul className={styles.linkList}>
                            {['Trang chủ', 'Danh sách xe', 'Liên hệ'].map((link, i) => (
                                <li key={i}>
                                    <a href={
                                        link === 'Home'
                                            ? '/'
                                            : link === 'Liên hệ'
                                                ? '/contact'
                                                : '/cars'}
                                        className={styles.linkItem}
                                    >
                                        <span className={styles.bullet}></span>
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <h3 className={styles.sectionTitle}>
                            Liên Hệ Với Chúng Tôi
                            <span className={styles.underline} />
                        </h3>

                        <ul className={styles.contactList}>
                            <li className={styles.contactItem}>
                                <FaMapMarkedAlt className={styles.contactIcon} />
                                <span>Số 45, đường Trần Cung, Cổ Nhuế, Hà Nội</span>
                            </li>

                            <li className={styles.contactItem}>
                                <FaPhone className={styles.contactIcon} />
                                <span>+84 392028683</span>
                            </li>

                            <li className={styles.contactItem}>
                                <FaEnvelope className={styles.contactIcon} />
                                <span>canvantu68@gmail.com</span>
                            </li>
                        </ul>

                        <div className={styles.hoursContainer}>
                            <h4>Giờ Làm Việc</h4>
                            <div className={styles.hoursText}>
                                <p>Thứ 2 - Thứ 6: 8:00 AM - 8:00PM</p>
                                <p>Thứ 7: 8:00 AM - 6:00PM</p>
                                <p>Chủ Nhật: 10:00 AM - 4:00PM</p>
                            </div>
                        </div>
                    </div>

                    {/* NEWSLETTER */}
                    <div>
                        <h3 className={styles.sectionTitle}>
                            Nhận Thông Tin Ưu Đãi
                            <span className={styles.underline}></span>
                        </h3>

                        <p className={styles.newsletterText}>
                            Đăng ký để nhận các ưu đãi và thông tin mới nhất
                        </p>

                        <form className="space-y-3">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                className={styles.input}
                            />

                            <button type="submit" className={styles.subscribeButton}>
                                <GiCarKey className="mr-2 text-lg sm:text-xl" />
                                Đăng Ký Ngay
                            </button>
                        </form>
                    </div>
                </div>

                {/* BOTTOM COPYRIGHT */}
                <div className={styles.copyright}>
                    <p>
                        &copy; {new Date().getFullYear()} KARZONE. All rights reserved.
                    </p>

                    <p className="mt-3 md:mt-0">
                        Designed by{" "}
                        <a
                            href="https://www.facebook.com/ko.ajtm/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.designerLink}
                        >
                            Can Van Tu
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;