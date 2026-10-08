# 🥄 먹지 (Muckzi) - Frontend

> "오늘 뭐 먹지?" 고민을 지도 위에서 해결하는 음식점 리뷰 서비스

🔗 **서비스 바로가기** : https://muckzi.vercel.app
📖 **프로젝트 상세 소개 (기능 · 아키텍처 · ERD · 트러블슈팅)** : [백엔드 저장소 README](https://github.com/sanghyeonJ/muckzi-back)

<br>

## 🛠 기술 스택

| 구분       | 기술                    |
| ---------- | ----------------------- |
| Framework  | React 19                |
| Build Tool | Vite                    |
| Styling    | Tailwind CSS v4         |
| Map        | 카카오맵 JavaScript SDK |
| Deploy     | Vercel                  |
| Runtime    | Node.js 24              |

<br>

## ✨ 프론트엔드 구현 포인트

- **지도 기반 UI** : 카카오맵 SDK로 지도를 표시하고, 검색한 음식점을 지도와 목록에서 함께 확인
- **반응형 레이아웃** : PC에서는 지도와 목록을 나란히, 모바일에서는 드래그 가능한 바텀시트로 구성
- **JWT 인증 연동** : 로그인 후 발급받은 토큰으로 API를 호출하고, 권한에 따라 관리자 페이지 접근 제어
- **iOS 대응** : 아이폰 Safari에서 입력창 선택 시 화면이 확대되는 문제를 모바일 입력창 글자 크기 16px 지정으로 해결

<br>

## ⚙️ 환경변수

API 서버 주소와 지도 키는 코드에 직접 넣지 않고 환경변수로 분리했습니다.
로컬에서는 `.env` 파일, 배포 환경에서는 Vercel 환경변수로 주입합니다.

| 이름                 | 설명                   |
| -------------------- | ---------------------- |
| `VITE_API_URL`       | 백엔드 API 서버 주소   |
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JavaScript 키 |

<br>

## 🚀 실행 방법

```bash
npm install
npm run dev
```
