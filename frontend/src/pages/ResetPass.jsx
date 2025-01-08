import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { sendOtpToEmailResetPass, verifyResetPass } from "../services/auth";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập Email");
      return;
    }
    const response = await sendOtpToEmailResetPass({ email });
    if (response.success) {
        setIsOtpVerified(true);
        toast.success("OTP đã được gửi đến email của bạn!");
    } else {
        toast.error(response.error);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if(!otp ||!newPassword || !confirmPassword){
        toast.error("Vui lòng nhập mật khẩu và xác nhận mật khẩu");
        return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    const response = await verifyResetPass({ email, password: newPassword, otp });
    if (response.success) {
      toast.success("Mật khẩu đã được thay đổi thành công!");
      navigate('/login'); // Chuyển hướng tới trang đăng nhập
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Link to="/">
          <img
            src="./logo.webp"
            alt="auto_document_reader"
            className="mx-auto h-20 "
          />
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Đặt lại mật khẩu
          </span>
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Nhập địa chỉ email đã đăng ký để khôi phục mật khẩu tài khoản của bạn.
        </p>
        {!isOtpVerified ? (
          // Form nhập email và OTP
          <form onSubmit={handleSubmitEmail} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Địa chỉ email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Gửi mã OTP
            </button>
          </form>
        ) : (
          // Form nhập mật khẩu mới
          <form onSubmit={handleSubmitPassword} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Mã OTP
              </label>
              <input
                type="text"
                id="otp"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mã OTP đã nhận"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Đặt lại mật khẩu
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Quay lại trang{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
