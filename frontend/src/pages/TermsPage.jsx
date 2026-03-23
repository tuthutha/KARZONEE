import React from "react";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white px-6 py-10">
            <div className="max-w-5xl mx-auto bg-slate-900/80 border border-slate-700 rounded-3xl p-8 md:p-10">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-block text-orange-400 hover:underline font-medium cursor-pointer"
                    >
                        ← Quay lại trang trước
                    </button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-orange-400 mb-6">
                    Điều Khoản và Điều Kiện Sử Dụng Dịch Vụ KarZone
                </h1>

                <p className="text-slate-300 mb-6">
                    Cập nhật lần cuối: 23/03/2026
                </p>

                <div className="space-y-6 text-slate-200 leading-8">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">1. Giới thiệu</h2>
                        <p>
                            Chào mừng bạn đến với KarZone. Điều Khoản và Điều Kiện này điều chỉnh
                            việc bạn truy cập, đăng ký tài khoản, tìm kiếm thông tin xe và sử dụng
                            các chức năng đặt xe trên website KarZone. Khi truy cập hoặc sử dụng
                            dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều
                            khoản này.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            2. Đối tượng áp dụng
                        </h2>
                        <p>
                            Điều khoản này áp dụng đối với mọi cá nhân, tổ chức truy cập website
                            KarZone, tạo tài khoản, gửi yêu cầu đặt xe hoặc sử dụng bất kỳ chức
                            năng nào do KarZone cung cấp.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            3. Điều kiện sử dụng dịch vụ thuê xe
                        </h2>
                        <p>
                            Để sử dụng dịch vụ đặt và thuê xe tại KarZone, người dùng phải từ đủ
                            18 tuổi trở lên tại thời điểm đăng ký hoặc đặt xe. Người dùng phải có
                            giấy phép lái xe hợp lệ, còn thời hạn sử dụng và phù hợp với loại
                            phương tiện thuê theo quy định của pháp luật Việt Nam. Trong trường
                            hợp cần thiết, KarZone có quyền yêu cầu người dùng cung cấp thêm căn
                            cước công dân, giấy tờ tùy thân hoặc các thông tin xác minh khác trước
                            khi xác nhận đơn đặt xe. KarZone có quyền từ chối cung cấp dịch vụ nếu
                            người dùng không đáp ứng đầy đủ các điều kiện nêu trên, cung cấp giấy
                            tờ không hợp lệ hoặc có dấu hiệu giả mạo thông tin.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            4. Tài khoản người dùng
                        </h2>
                        <p>
                            Người dùng có trách nhiệm cung cấp thông tin chính xác, đầy đủ và cập
                            nhật khi đăng ký tài khoản. Bạn chịu trách nhiệm bảo mật thông tin đăng
                            nhập, mật khẩu và mọi hoạt động phát sinh dưới tài khoản của mình.
                            KarZone có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện thông
                            tin giả mạo, hành vi gian lận, lạm dụng hệ thống hoặc vi phạm điều khoản
                            sử dụng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            5. Phạm vi dịch vụ
                        </h2>
                        <p>
                            KarZone cung cấp nền tảng trực tuyến để người dùng tham khảo thông tin
                            xe, giá thuê, thời gian thuê dự kiến, gửi yêu cầu đặt xe và quản lý đơn
                            đặt xe. Việc hiển thị xe, giá thuê, tình trạng sẵn sàng hoặc xác nhận đặt
                            xe trên hệ thống phụ thuộc vào dữ liệu vận hành thực tế và có thể được
                            KarZone điều chỉnh, cập nhật hoặc từ chối trong một số trường hợp cần
                            thiết.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            6. Quy trình đặt xe
                        </h2>
                        <p>
                            Khi gửi yêu cầu đặt xe, bạn cần cung cấp đầy đủ thông tin nhận xe, thời
                            gian thuê, thông tin liên hệ và các dữ liệu cần thiết khác. Yêu cầu đặt
                            xe chỉ được coi là hợp lệ khi được KarZone tiếp nhận và xác nhận theo quy
                            trình của hệ thống. KarZone có quyền liên hệ để xác minh thông tin trước
                            khi xác nhận đơn, từ chối yêu cầu nếu thông tin không chính xác hoặc xe
                            không còn khả dụng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            7. Giá thuê, thanh toán và chi phí
                        </h2>
                        <p>
                            Giá thuê hiển thị trên website là mức tham khảo hoặc mức áp dụng tại thời
                            điểm hiển thị, có thể thay đổi theo từng dòng xe, thời điểm thuê, thời
                            lượng thuê hoặc chương trình ưu đãi. Tổng chi phí thực tế có thể bao gồm
                            tiền thuê xe, tiền cọc, phụ phí phát sinh, phí vi phạm, bồi thường thiệt
                            hại hoặc các khoản khác theo chính sách cụ thể được thông báo cho người
                            dùng trước khi xác nhận giao dịch.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            8. Quyền và nghĩa vụ của người dùng
                        </h2>
                        <p>
                            Người dùng cam kết sử dụng website đúng mục đích hợp pháp, không can
                            thiệp trái phép vào hệ thống, không phát tán mã độc, không giả mạo thông
                            tin, không xâm phạm quyền và lợi ích hợp pháp của KarZone hoặc bên thứ
                            ba. Người dùng có trách nhiệm tuân thủ quy định pháp luật khi sử dụng xe,
                            bảo quản xe cẩn thận, sử dụng đúng công năng và chịu trách nhiệm đối với
                            các hành vi vi phạm do mình gây ra.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            9. Quyền và nghĩa vụ của KarZone
                        </h2>
                        <p>
                            KarZone có quyền vận hành, nâng cấp, bảo trì, chỉnh sửa giao diện, tính
                            năng, dữ liệu hiển thị và chính sách dịch vụ nhằm bảo đảm an toàn, ổn
                            định và phù hợp với nhu cầu vận hành. KarZone có trách nhiệm cung cấp
                            thông tin cơ bản về dịch vụ một cách minh bạch, tiếp nhận phản hồi hợp
                            lý từ người dùng và xử lý dữ liệu cá nhân theo chính sách áp dụng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            10. Hủy đơn, thay đổi lịch và hoàn tiền
                        </h2>
                        <p>
                            Việc hủy đơn, thay đổi thời gian nhận xe, đổi xe hoặc hoàn tiền sẽ được
                            thực hiện theo chính sách vận hành của KarZone tại từng thời điểm. KarZone
                            có quyền áp dụng thời hạn thông báo trước, mức phí hủy, điều kiện hoàn
                            tiền hoặc từ chối hoàn tiền trong các trường hợp vi phạm điều khoản, cung
                            cấp thông tin sai lệch, chậm nhận xe hoặc phát sinh yếu tố bất khả kháng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            11. Giới hạn trách nhiệm
                        </h2>
                        <p>
                            KarZone nỗ lực duy trì tính chính xác của thông tin hiển thị và sự ổn
                            định của hệ thống, tuy nhiên không bảo đảm website sẽ luôn hoạt động liên
                            tục, không có lỗi hoặc không bị gián đoạn. Trong phạm vi pháp luật cho
                            phép, KarZone không chịu trách nhiệm đối với các thiệt hại gián tiếp, mất
                            dữ liệu, mất lợi nhuận hoặc tổn thất phát sinh do lỗi đường truyền, sự cố
                            kỹ thuật, hành vi của bên thứ ba hoặc việc người dùng vi phạm nghĩa vụ sử
                            dụng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            12. Dữ liệu cá nhân và quyền riêng tư
                        </h2>
                        <p>
                            KarZone có thể thu thập và xử lý các thông tin như họ tên, email, số điện
                            thoại, địa chỉ nhận xe, thông tin tài khoản và dữ liệu liên quan đến giao
                            dịch nhằm phục vụ đăng ký tài khoản, xác nhận đơn đặt xe, hỗ trợ khách
                            hàng, cải thiện dịch vụ và đáp ứng yêu cầu pháp luật. Người dùng có trách
                            nhiệm cung cấp dữ liệu chính xác và đồng ý cho KarZone xử lý dữ liệu trong
                            phạm vi cần thiết để cung cấp dịch vụ.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            13. Sở hữu trí tuệ
                        </h2>
                        <p>
                            Toàn bộ giao diện, nội dung, logo, hình ảnh, biểu tượng, bố cục, mã nguồn
                            hiển thị và các tài liệu liên quan trên website KarZone thuộc quyền sở hữu
                            của KarZone hoặc bên cấp phép hợp pháp. Người dùng không được sao chép,
                            chỉnh sửa, phát tán, khai thác thương mại hoặc sử dụng trái phép bất kỳ
                            nội dung nào khi chưa có sự đồng ý bằng văn bản của KarZone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            14. Hành vi bị cấm
                        </h2>
                        <p>
                            Nghiêm cấm các hành vi giả mạo danh tính, tạo đơn ảo, gian lận thanh toán,
                            truy cập trái phép, khai thác lỗ hổng hệ thống, thu thập dữ liệu trái phép,
                            phá hoại website, đăng tải nội dung vi phạm pháp luật hoặc sử dụng dịch vụ
                            vào mục đích trái đạo đức, trái pháp luật.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            15. Tạm ngừng hoặc chấm dứt dịch vụ
                        </h2>
                        <p>
                            KarZone có quyền tạm ngừng hoặc chấm dứt quyền truy cập của người dùng
                            trong trường hợp cần bảo trì hệ thống, có yêu cầu từ cơ quan có thẩm quyền,
                            phát hiện rủi ro an ninh hoặc phát hiện người dùng vi phạm điều khoản này.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            16. Sửa đổi điều khoản
                        </h2>
                        <p>
                            KarZone có quyền sửa đổi, bổ sung hoặc cập nhật Điều Khoản và Điều Kiện
                            vào bất kỳ thời điểm nào. Phiên bản cập nhật sẽ được đăng tải trên website
                            và có hiệu lực từ thời điểm công bố, trừ khi có thông báo khác. Việc bạn
                            tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với
                            việc bạn chấp nhận các sửa đổi đó.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            17. Luật áp dụng và giải quyết tranh chấp
                        </h2>
                        <p>
                            Điều khoản này được điều chỉnh theo pháp luật Việt Nam. Mọi tranh chấp phát
                            sinh trước hết sẽ được các bên ưu tiên giải quyết thông qua thương lượng và
                            hòa giải. Trường hợp không thể giải quyết bằng thương lượng, tranh chấp có
                            thể được đưa ra cơ quan nhà nước có thẩm quyền hoặc tòa án có thẩm quyền
                            theo quy định pháp luật.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            18. Thông tin liên hệ
                        </h2>
                        <p>
                            Nếu bạn có câu hỏi, khiếu nại hoặc yêu cầu liên quan đến Điều Khoản và Điều
                            Kiện này, vui lòng liên hệ KarZone qua email, số điện thoại hoặc địa chỉ hỗ
                            trợ được công bố chính thức trên website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;