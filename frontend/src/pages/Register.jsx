import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { register, sendOtpToEmailRegister } from '../services/auth';
import { toast } from 'react-toastify';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(0); // Timer for OTP countdown
  const [isDisabled, setIsDisabled] = useState(false); // Disable the OTP button
  const navigate = useNavigate();

  // Handle OTP button click (send OTP)
  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email!');
      return;
    }
    
    // Giả sử bạn có một API gửi OTP
    const response = await sendOtpToEmailRegister({email});
    if (response.success) {
      toast.success('Mã OTP đã được gửi!');
      setIsOtpSent(true); // Set OTP sent to true
      setIsDisabled(true); // Disable button after sending
      startOtpTimer(); // Start OTP countdown timer
    } else {
      toast.error('Có lỗi xảy ra khi gửi mã OTP.');
    }
  };

  const startOtpTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setIsDisabled(false); //
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu có khớp không
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }

    // Kiểm tra OTP
    if (!otp) {
      toast.error('Vui lòng nhập mã OTP!');
      return;
    }

    // Gửi request đăng ký
    const response = await register({ email, password, otp });
    if (response.success) {
      toast.success('Đăng ký thành công!', {
        icon: '🎉',
      });
      navigate('/login'); // Chuyển hướng tới trang đăng nhập
    } else {
      toast.error(response.error);
    }
  };

  // Helper function to format the timer in mm:ss format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Link to="/">
          <img src="./logo.webp" alt="auto_document_reader" className="mx-auto h-20 " />
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Đăng ký tài khoản</span>
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Tạo một tài khoản để cùng LOR trải nghiệm nha!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Mã OTP</label>
            <div className="flex space-x-4">
              <input
                type="text"
                id="otp"
                className="w-70 px-4 py-2 border rounded-lg"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="button"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg"
                onClick={handleSendOtp}
                disabled={isDisabled}
              >
                {isDisabled ? `Gửi lại (${formatTime(timer)})` : 'Gửi mã OTP'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Đăng ký
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            Đăng nhập tại đây!
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
