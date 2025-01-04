import React, { useEffect, useState } from "react";
import axios from "axios";

const History = () => {
  const [responseData, setResponseData] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchData = async () => {
    try {
      // Lấy dữ liệu từ localStorage
      const token = localStorage.getItem("user");

      // Gửi GET request với params
      const response = await axios.get(`${API_URL}/document/getdata`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      setResponseData(response.data); // Set dữ liệu trả về
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("user");

    // Gửi GET request với params
    const response = await axios.post(`${API_URL}/document/delete/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if(response.status === 200) {
      fetchData()
    }
    else {
      console.log('Delete failure')
    }
  }

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64); // Giải mã Base64 thành chuỗi nhị phân
    const byteArrays = [];

    // Chuyển đổi chuỗi nhị phân thành Uint8Array
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    // Tạo Blob từ mảng byte
    return new Blob(byteArrays, { type: mimeType });
  };

  return (
    <div className="flex flex-col flex-1 p-4 pb-8 md:px-8 lg:px-12 gap-4">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">Lịch sử tạo âm thanh</h1>

      {/* Notice */}
      {/* <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Lưu ý:</span> Tệp âm thanh chỉ được lưu giữ trong 72 giờ.
            </p> */}
      <p className="text-sm text-gray-500 mb-4">0 của 0 hàng đã chọn.</p>

      {/* Table Headers */}
      <div className="max-w-8xl border rounded-md overflow-auto">
        <div className="bg-gray-100 flex">
          <div className="px-3 py-2 w-12"></div>
          <div className="px-3 py-2 w-1/5 font-medium">Văn bản</div>
          <div className="px-3 py-2 w-1/6 font-medium">Giọng nói</div>
          <div className="px-3 py-2 w-1/5 font-medium">Được tạo vào</div>
          <div className="px-3 py-2 w-1/3 font-medium">Âm thanh</div>
          <div className="px-3 py-2 w-1/5 font-medium">Hành động</div>
        </div>
        {responseData?.length > 0 ? (
          responseData.map((item, index) => {
            const blob = base64ToBlob(item.audio, "audio/mp3");
            const audioURL = URL.createObjectURL(blob); // Tạo URL từ Blob
            return (
              <div key={index} className="flex">
              <div className="px-3 py-2 w-12"></div>
              <div className="px-3 py-2 w-1/5 truncate">{item.text}</div>
              <div className="px-3 py-2 w-1/6">{item.voice}</div>
              <div className="px-3 py-2 w-1/5">{item.created_at}</div>
              <div className="px-3 py-2 w-1/3 truncate">
                <audio src={audioURL} className="w-full" id={item._id} controls></audio>
              </div>
              <div className="px-3 py-2 w-1/5">
                <button className="bg-red-500 text-white py-2 px-8 rounded" onClick={() => handleDelete(item._id)}>Xóa</button>
              </div>
            </div>
            )
          })
        ) : (
          <div className="flex flex-col py-20 justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-folder-open h-12 w-12 stroke-[1.1px]"
            >
              <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
            </svg>
            <p>No data available</p>
          </div>
        )}
      </div>

      {/* Pagination Buttons */}
      {/* <div className="flex justify-end items-center mt-4 space-x-2">
                <button className="px-3 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-100">Trước</button>
                <button className="px-3 py-2 text-sm bg-gray-100 border rounded-md text-gray-600 hover:bg-gray-200">Tiếp theo</button>
            </div> */}
    </div>
  );
};

export default History;
