import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { textToSpeech } from "../services/api";

const TTS = ({ params }) => {
  const [text, setText] = useState(params.text || "");
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [language, setLanguage] = useState(params.lang || "vi-VN");
  const [voice, setVoice] = useState(params.voice || "FEMALE");
  const [audioBase64, setAudioBase64] = useState(params.audio || ""); // Lưu trữ Base64 từ API
  const [id, setId] = useState(params._id || "audioPlayer");
  const [audioPlayer, setAudioPlayer] = useState(null); // Lưu trữ phần tử audio
  const [isLoading, setIsLoading] = useState(false);
  const [test, setTest] = useState(0);
  const [textSummary, setTextSummary] = useState(0);
  const [focusInput,setFocusInput] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleFocus = (name) => {
    setFocusInput(name);
    console.log(`Đang focus vào: ${name}`);
  };

  const textInput = useRef(null);
  // Hàm lấy Base64 từ API và điều chỉnh tốc độ
  const getAndAdjustAudio = async () => {
    if (!text.trim()) {
      toast.error("Bạn chưa nhập văn bản ^^!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      textInput.current.focus();
      return;
    }
    setIsLoading(true);
    let need_text = ''
    if(focusInput === 0) {
      toast.error("Focus vào ô input cần chuyển văn bản thành giọng nói!")
      setIsLoading(false); // Kết thúc loading
      return;
    }
    else if(focusInput === 1) {
      need_text = text;
    }
    else {
      need_text = textSummary;
    }
    
    try {
      
      const text_api = need_text; // Nội dung văn bản cần chuyển thành âm thanh
      const lang_api = language; // Ngôn ngữ
      const gender_api = voice; // Giới tính
      const token_api = localStorage.getItem("user");

      const params = new URLSearchParams();
      params.append("text", text_api);
      params.append("lang", lang_api);
      params.append("gender", gender_api);

      // Gửi yêu cầu POST để lấy Base64 từ API
      const response = await fetch(`${API_URL}/googleapi/texttospeech`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token_api}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch audio from API");
      }

      const data = await response.json();
      setId(data.id);
      setAudioBase64(data.data); // Lưu Base64 nhận được từ API
    } catch (error) {
      console.error("Error fetching or processing audio:", error);
      toast.error("Lỗi khi tạo giọng nói, vui lòng thử lại sau!", {
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  // Hàm chuyển Base64 thành Blob
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

  // Hàm để phát lại âm thanh từ base64

  // Hàm để phát lại âm thanh từ base64
  const playAudio = (base64) => {
    // console.log(base64, audioPlayer)
    if (base64 && audioPlayer) {
      // Chuyển Base64 thành Blob với loại âm thanh 'audio/mp3'
      const blob = base64ToBlob(base64, "audio/mp3");
      const audioURL = URL.createObjectURL(blob); // Tạo URL từ Blob

      // Thiết lập nguồn phát cho phần tử audio
      audioPlayer.src = audioURL;
      audioPlayer.currentTime = params.position || 0;
      audioPlayer.playbackRate = speed; // Đặt tốc độ phát lại
      audioPlayer.volume = volume / 100;
      audioPlayer.play(); // Phát âm thanh
    }
  };
  // Cập nhật tốc độ phát
  const handleSpeedChange = (value) => {
    setSpeed(parseFloat(value));
    if (audioPlayer) {
      audioPlayer.playbackRate = parseFloat(value);
    }
  };

  // Cập nhật âm lượng
  const handleVolumeChange = (value) => {
    setVolume(Number(value));
    if (audioPlayer) {
      audioPlayer.volume = Number(value) / 100; // Volume từ 0 đến 1
    }
  };
  const handleReset = () => {
    setSpeed(1);
    setVolume(100);
    setLanguage("vi-VN");
    setVoice("FEMALE");
    setText("");
    setTest(false);
  };

  const handleAudioEnded = (audio) => {
    saveAudioPositionAndPause(audio, audio.id, 0);
  };

  const saveAudioPositionAndPause = async (audio, audioId, pos) => {
    if (audioId === "audioPlayer") return;
    if (audio) {
      const params = new URLSearchParams();
      params.append("position", pos);

      const token_api = localStorage.getItem("user");
      console.log(audio.currentTime);
      // Gửi yêu cầu POST để lấy Base64 từ API
      const respnose = await fetch(`${API_URL}/document/update/${audioId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token_api}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(), // Dữ liệu được mã hóa x-www-form-urlencoded
      });
      if (respnose?.status === 200) {
        console.log("Success");
      } else {
        console.log("Failure");
      }
    }
  };

  const handleBeforeUnload = (event) => {
    if (audioPlayer && audioPlayer?.src) {
      audioPlayer.pause();
      // Tùy chọn: Cảnh báo người dùng nếu họ chưa lưu
      event.returnValue = "Are you sure you want to leave?";
    }
  };

  const handlePause = (audio) => {
    if (audio.target) {
      saveAudioPositionAndPause(
        audio.target,
        audio.target.id,
        audio.target.currentTime
      );
    }
  };
  //tóm tắt
  const handlerSummary = async (text) => {
    if (text == "") {
      toast.error("Vui lòng nhập văn bản!");
      return;
    }
    if (text.length < 300) {
      toast.error("Văn bản quá ngắn!");
      return;
    }
    const params = new URLSearchParams();
    params.append("text", text);

    // Gửi yêu cầu POST để lấy Base64 từ API
    const response = await fetch(`${API_URL}/googleapi/summary`, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token_api}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch audio from API");
    }

    const data = await response.json();

    setTextSummary(data.data);
    setTest(1);
  };
  //dịch
  const handleTranslate= async (text) => {
    if (text == "") {
      toast.error("Vui lòng nhập văn bản!");
      return;
    }
    const lang_api = language; // Ngôn ngữ
    const params = new URLSearchParams();
    params.append("text", text);
    params.append("lang", lang_api);

    // Gửi yêu cầu POST để lấy Base64 từ API
    const response = await fetch(`${API_URL}/googleapi/translate`, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token_api}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch audio from API");
    }

    const data = await response.json();

    setTextSummary(data.data);
    setTest(2);
  };
  useEffect(
    () => {
      if (audioBase64) {
        playAudio(audioBase64);
      }
      if (audioPlayer) {
        audioPlayer.playbackRate = speed; // Cập nhật tốc độ
        audioPlayer.volume = volume / 100; // Cập nhật âm lượng
      }
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        if (id !== "audioPlayer")
          saveAudioPositionAndPause(
            audioPlayer,
            id,
            audioPlayer?.currentTime || 0
          ); // Lưu và dừng audio khi component bị unmount
      };
    },
    [audioBase64, audioPlayer, test, textSummary],
    [speed, volume]
  ); // Mỗi khi audioBase64 thay đổi, sẽ gọi playAudio

  return (
    <div className="flex flex-1 flex-col gap-2 p-3 pb-8 md:px-8 lg:px-12">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Chuyển văn bản thành giọng nói
      </h1>

      {/* Khung nhập văn bản */}
      <div className="flex-1 mb-4">
        <textarea
          value={text}
          ref={textInput}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => handleFocus(1)}
          className="w-full h-40 border rounded-lg p-4 text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Nhập văn bản của bạn tại đây..."
          maxLength={5000}
        />
        <div className="text-right text-gray-500 mt-1">
          {text.length} / 5000
        </div>
      </div>
      {test ? (
        <div className="flex-1 mb-4">
          <span className="text-2xl font-bold text-gray-800">
           {test === 1 ? 'Văn bản tóm tắt' : 'Văn bản dịch'} 
          </span>
          <textarea
            value={textSummary}
            ref={textInput}
            onFocus={() => handleFocus(2)}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-40 border rounded-lg p-4 text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Nhập văn bản của bạn tại đây..."
            maxLength={5000}
          />
          <div className="text-right text-gray-500 mt-1">
            {textSummary.length} / 5000
          </div>
        </div>
      ) : (
        ""
      )}

      <audio
        className="w-full"
        ref={(ref) => setAudioPlayer(ref)}
        id={id}
        controls
        onPause={handlePause}
        onEnded={() => handleAudioEnded(audioPlayer)}
      ></audio>
      {/* Thanh công cụ */}
      <div className="flex justify-end items-center space-x-2 mb-4">
        <button
          onClick={handleReset}
          className="text-gray-600 px-3 py-2 border rounded-lg hover:bg-gray-100"
        >
          Xóa văn bản
        </button>
        <button
          onClick={() => handlerSummary(text)}
          className="text-gray-600 px-3 py-2 border rounded-lg hover:bg-gray-100"
        >
          Tóm tắt
        </button>{" "}
        <button
          onClick={() => handleTranslate(text)}
          className="text-gray-600 px-3 py-2 border rounded-lg hover:bg-gray-100"
        >
          Dịch
        </button>{" "}
        <button
          onClick={getAndAdjustAudio}
          className={`px-4 py-2 rounded-lg ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={isLoading} // Vô hiệu hóa nút khi đang loading
        >
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                ></path>
              </svg>
              <span>Đang tạo...</span>
            </span>
          ) : (
            "Tạo giọng nói"
          )}
        </button>
      </div>

      {/* Cài đặt giọng nói */}
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Cột 1 */}
        <div className="flex-1 mb-4">
          <h2 className="text-lg font-semibold mb-2">Cài đặt giọng nói</h2>
          <div className="flex items-center mb-2">
            {/* <button
              className={`px-3 py-2 rounded-lg border ${
                voiceType === "standard"
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "text-gray-700"
              }`}
              onClick={() => setVoiceType("standard")}
            >
              Giọng nói chuẩn
            </button> */}
            {/* <button
              className={`px-3 py-2 rounded-lg ml-2 border ${
                voiceType === "custom" ? "bg-blue-50 border-blue-500 text-blue-600" : "text-gray-700"
              }`}
              onClick={() => setVoiceType("custom")}
            >
              Giọng nói đã nhân bản
            </button> */}
          </div>

          {/* Chọn ngôn ngữ */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Chọn ngôn ngữ
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none"
            >
              <option value="en-US">English (United States)</option>
              <option value="vi-VN">Tiếng Việt</option>
            </select>
          </div>

          {/* Chọn giọng nói */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Chọn giọng nói
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none"
            >
              <option value="FEMALE">Nữ (Female)</option>
              <option value="MALE">Nam (Male)</option>
            </select>
          </div>
        </div>

        {/* Cột 2 */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Tùy chỉnh</h2>
          {/* Tốc độ */}

          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-1"
              htmlFor="speedControl"
            >
              Tốc độ:{" "}
            </label>
            <input
              className="w-full"
              type="range"
              id="speedControl"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              // ref={(ref) => setSpeed(ref)}
              onChange={(e) => handleSpeedChange(e.target.value)}
            />
            <span id="speedValue">{speed}x</span>
          </div>

          {/* Âm lượng */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Âm lượng
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-full"
            />
            <span>{volume}%</span>
          </div>

          {/* Cao độ */}
          {/* <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Cao độ
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full"
            />
          </div> */}

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 border rounded-lg text-gray-600 hover:bg-gray-200"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default TTS;
