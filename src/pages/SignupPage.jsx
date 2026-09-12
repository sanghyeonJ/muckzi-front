import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignupPage() {

  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e) => {

    e.preventDefault();
    if(!userId.trim()){
      alert("아이디를 입력해주세요.");
      return;
    }
    if(!password.trim()){
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if(!nickname.trim()){
      alert("닉네임을 입력해주세요.");
      return;
    }

    try{
      const response = await axios.post(
        "http://localhost:8080/api/auth/signup",
        {
          userId,
          password,
          nickname
        }
      );

      console.log(response);
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    }catch(error){
      console.error(error);
      alert(error.response?.data?.message ||"회원가입에 실패했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            회원가입
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            맛있는 곳을 함께 찾아보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label
              htmlFor="userId"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              아이디
            </label>

            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디를 입력해주세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="nickname"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              닉네임
            </label>

            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력해주세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            회원가입
          </button>

        </form>

      </div>

    </div>
  );
}

export default SignupPage;