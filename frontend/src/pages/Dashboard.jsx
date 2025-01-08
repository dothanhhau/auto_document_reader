import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import TTS from "../components/TTS"; // Component Text-to-Speech chính
import UploadDocument from "../components/UploadDocument"; // Component Upload file
import History from "../components/History";
import { useUser } from "../context/UserContext"; // Context lấy thông tin user
import axios from "axios";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("textToSpeech");
  const API_URL = process.env.REACT_APP_API_URL;
  const { usera, loading } = useUser(); // Lấy thông tin user từ context
  const [params, setParams] = useState({});
  const [isPopupVisible, setPopupVisible] = useState(false);
  const popupRef = useRef(null);
  const [userData, setUserData] = useState(null);
  // Giả sử thông tin người dùng
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    credits: "18299 Tín dụng",
  };

  // Hàm đăng xuất
  const handleLogout = async () => {
    // Xóa token trong localStorage và điều hướng đến trang login
    try {
      const response = await axios.post(`${API_URL}/auth/logout`, {email: userData.data}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      localStorage.removeItem("user");
      window.location.href = "/login"; // Điều hướng về trang login
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng xuất thất bại',
      };
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem click có xảy ra ngoài popup và avatar không
      if (popupRef && popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupVisible(false); // Đóng popup nếu click ra ngoài
      }
    };

    const handleBeforeUnload = (event) => {
      // Cảnh báo người dùng trước khi rời khỏi trang
      
      const message = "Bạn có chắc chắn muốn rời khỏi trang?";
      // Các trình duyệt hiện đại yêu cầu phải gán thông báo này vào event.returnValue
      event.returnValue = message;
      
      // Các trình duyệt cũ có thể yêu cầu thêm dòng này
      return message;
    };
    // window.addEventListener('beforeunload', handleBeforeUnload);

    // Thêm sự kiện click toàn cục
    document.addEventListener("click", handleClickOutside);

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('user');

    if (!token) {
      // Nếu không có token, chuyển hướng đến trang đăng nhập
      window.location.href = "/login";
      return;
    }

    // Gửi request đến backend để lấy dữ liệu dashboard
    axios
      .get(`${API_URL}/auth/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
        window.location.href = "/login"; // Nếu token không hợp lệ, chuyển hướng về trang đăng nhập
      });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab !== 'textToSpeech') {
      setParams({});
    }
  };

  return (
    <div className="flex min-h-screen w-full h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-7 flex-grow">
          {/* Logo */}
          <div className="mb-7">
            <Link to="/dashboard" className="flex items-center no-underline">
              <img src="./logo.webp" alt="Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semibold text-gray-800">
                LOR
              </span>
            </Link>
            <hr className="mt-4 border-gray-600" />
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {" "}
            <button
              onClick={() => handleTabChange("textToSpeech")}
              className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-medium ${
                activeTab === "textToSpeech"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-file-text mr-2 h-7 w-7"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
              Chuyển văn bản thành giọng nói
            </button>
            <button
              onClick={() => handleTabChange("fileToSpeech")}
              className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-medium ${
                activeTab === "fileToSpeech"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-file-audio mr-2 h-7 w-7"
              >
                <path d="M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0"></path>
              </svg>
              Chuyển tệp thành giọng nói
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-medium ${
                activeTab === "history"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-history mr-2 h-5 w-5"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M12 7v5l4 2"></path>
              </svg>
              Lịch sử
            </button>
          </nav>
        </div>

        <div className="p-4">
        <hr className="mt-4 border-gray-600" />

          {/* User Profile */}
          <div className="flex items-center mt-4 space-x-2 relative cursor-pointer"
            onClick={() => setPopupVisible(!isPopupVisible)} // Toggle popup khi click vào avatar
            ref={popupRef}
            // onMouseEnter={() => setPopupVisible(true)} // Hiển thị popup khi hover
            // onMouseLeave={() => setPopupVisible(false)} // Ẩn popup khi không hover
          >
          
          <div className="flex flex-col truncate overflow-hidden cursor-pointer">
            <span className="font-medium truncate">{userData?.data}</span>
            <span className="text-sm text-gray-500"></span>
          </div>

          {/* Popup hiển thị thông tin người dùng */}
          {isPopupVisible && (
            <div 
              className="absolute left-0 bottom-full mb-2 w-64 p-4 bg-white border border-gray-300 shadow-lg rounded-md"
            >
              <div className=" truncate overflow-hidden">
                <h3 className="font-semibold text-lg"></h3>
                <p className="text-sm text-gray-500 truncate">{userData.data}</p>
                <p className="text-sm text-gray-500 "></p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "textToSpeech" && (
          <div>
            {/* <h1 className="text-xl font-bold text-gray-800 mb-4">Chuyển văn bản thành giọng nói</h1> */}
            <TTS params={params} />
          </div>
        )}
        {activeTab === "fileToSpeech" && (
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">
              Chuyển tệp thành giọng nói
            </h1>
            <UploadDocument setActiveTab={setActiveTab} setParams={setParams} />
          </div>
        )}
        {activeTab === "history" && (
          <div>
            {/* <h1 className="text-xl font-bold text-gray-800 mb-4">Lịch sử</h1> */}
            <History setActiveTab={setActiveTab} setParams={setParams} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
