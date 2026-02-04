/**
 * 카카오 로그인 콜백 페이지 (/auth/kakao/callback)
 *
 * ✨ OAuth 인증 코드(code)는 백엔드에서 처리합니다.
 * 프론트엔드는 백엔드에서 리다이렉트된 후 토큰 저장 및 라우팅만 담당합니다.
 *
 * 플로우:
 * 1. 사용자가 카카오 로그인 버튼 클릭
 * 2. 프론트엔드가 카카오 인증 URL 생성 (redirect_uri: 백엔드 콜백 URL)
 * 3. 카카오 인증 페이지로 이동
 * 4. 카카오가 백엔드로 code 전달 (/api/auth/kakao/callback?redirect_uri={프론트 URL})
 * 5. 백엔드가 code를 받아서 카카오 토큰 교환 및 사용자 정보 처리
 * 6. 백엔드가 프론트엔드 redirect_uri(/auth/kakao/callback)로 리다이렉트 (accessToken, refreshToken, userId 전달)
 * 7. 이 페이지에서 토큰 저장 및 적절한 페이지로 이동:
 *    - 신규 회원 또는 기존 회원(온보딩 미실행) → /onboarding
 *    - 기존 회원(온보딩 실행) → 사장: /owner, 알바: /employee
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleKakaoSession } from "../../services/kakaoLogin.js";
import api from "../../services/Api.js";

function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // 백엔드에서 리다이렉트된 경우 에러 파라미터 확인
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const errorCode = searchParams.get("error_code");

      // KOE101 에러 처리
      if (
        error ||
        errorCode === "KOE101" ||
        errorDescription?.includes("KOE101")
      ) {
        console.error("❌ 카카오 로그인 에러 발생:", {
          error,
          errorCode,
          errorDescription,
        });

        let errorMessage = "카카오 로그인에 실패했습니다.";

        if (errorCode === "KOE101" || errorDescription?.includes("KOE101")) {
          errorMessage =
            "카카오 로그인 설정 오류(KOE101)가 발생했습니다.\n\n" +
            "가능한 원인:\n" +
            "1. 카카오 개발자 콘솔에 redirect_uri가 등록되지 않았습니다.\n" +
            "2. 앱 키(REST API 키)가 잘못되었습니다.\n" +
            "3. 환경변수 설정이 올바르지 않습니다.\n\n" +
            "관리자에게 문의하세요.";
        }

        alert(errorMessage);
        navigate(
          "/login?error=kakao_login_failed&code=" + (errorCode || error),
        );
        return;
      }

      try {
        console.log("백엔드에서 리다이렉트됨 - 세션 확인 시작");

        // 백엔드에서 이미 인증 처리를 완료했으므로,
        // 세션 정보를 확인하여 적절한 페이지로 이동
        // 백엔드가 URL 파라미터로 세션 정보를 전달할 수도 있고,
        // 쿠키/세션으로 설정했을 수도 있음

        // URL 파라미터에서 세션 정보 확인 (백엔드가 전달한 경우)
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const userId = searchParams.get("userId");
        const newUser = searchParams.get("newUser");
        const isNewUser = newUser === "true" || newUser === "1";

        if (accessToken) {
          // URL 파라미터로 토큰이 전달된 경우
          const session = {
            accessToken,
            refreshToken: refreshToken || null,
            userId: userId || null,
            newUser: isNewUser,
            isNewUser,
          };

          // refreshToken이 없으면 경고 로그
          if (!refreshToken) {
            console.warn(
              "⚠️ URL 파라미터에 refreshToken이 없습니다. 백엔드가 쿠키로 설정했을 수 있습니다.",
            );
          } else {
            console.log(
              "✅ accessToken 및 refreshToken을 URL 파라미터에서 받았습니다.",
            );
          }

          handleKakaoSession(session);

          // 신규 회원인 경우 온보딩으로 이동
          if (isNewUser) {
            console.log("신규 회원 -> 온보딩으로 이동");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
            navigate("/onboarding");
            return;
          }
        } else {
          // 쿠키/세션으로 설정된 경우, 백엔드 API로 사용자 정보 확인
          // (백엔드가 쿠키에 세션을 설정했다면 자동으로 인증됨)
          try {
            const profileRes = await api.get("auth/me");
            const userInfo = profileRes.data;

            // 백엔드가 쿠키로 토큰을 설정한 경우, localStorage에도 저장 필요
            // 백엔드 API 응답에 토큰이 포함되어 있는지 확인
            if (userInfo?.accessToken) {
              const session = {
                accessToken: userInfo.accessToken,
                refreshToken: userInfo.refreshToken || null,
                userId: userInfo.userId || null,
                newUser: userInfo.newUser || false,
                isNewUser: userInfo.newUser || false,
              };

              if (!session.refreshToken) {
                console.warn(
                  "⚠️ 백엔드 응답에 refreshToken이 없습니다. 쿠키로만 설정되었을 수 있습니다.",
                );
              } else {
                console.log(
                  "✅ 백엔드 API에서 accessToken 및 refreshToken을 받았습니다.",
                );
              }

              handleKakaoSession(session);
            } else {
              console.log(
                "⚠️ 백엔드 응답에 토큰이 없습니다. 쿠키로만 인증되었을 수 있습니다.",
              );
            }

            if (userInfo && userInfo.newUser !== undefined) {
              const isNewUserFromBackend =
                userInfo.newUser || userInfo.isNewUser;

              if (isNewUserFromBackend) {
                console.log("신규 회원 -> 온보딩으로 이동");
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname,
                );
                navigate("/onboarding");
                return;
              }
            }
          } catch (profileError) {
            console.log("프로필 조회 실패, 활성 매장 정보로 확인 시도");
            console.error("프로필 조회 에러:", profileError);
          }
        }

        // 기존 회원인 경우 정보 등록 상태 확인
        // 활성 매장 정보를 확인하여 온보딩 실행 여부 판단
        try {
          const activeStoreRes = await api.get("mypage/active-store");
          const activeStore = activeStoreRes.data;

          console.log("활성 매장 정보:", activeStore);

          // 활성 매장이 있으면 정보 등록 완료 -> 홈페이지로 이동
          if (activeStore && activeStore.storeId) {
            // 사용자 역할 확인을 위해 프로필 정보 조회 시도
            // owner 프로필을 먼저 시도
            try {
              await api.get("mypage/owner/profile");
              console.log("사장님 프로필 확인 성공 -> /owner로 이동");
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
              );
              navigate("/owner");
              return;
            } catch (ownerError) {
              const ownerStatus = ownerError.response?.status;

              // 500 에러는 서버 에러이므로, 토큰 갱신이 트리거될 수 있음
              // 하지만 이 경우는 "owner가 아니다"가 아니라 서버 문제일 수 있으므로
              // staff 체크로 넘어가되, 에러를 로깅
              if (ownerStatus === 500) {
                console.warn(
                  "⚠️ owner 프로필 조회 시 500 에러 발생 (서버 에러 가능성) -> staff 체크로 진행",
                );
              } else if (ownerStatus === 403 || ownerStatus === 404) {
                console.log("owner 프로필 없음 (403/404) -> staff 체크로 진행");
              } else {
                console.log(
                  "owner 프로필 조회 실패:",
                  ownerStatus,
                  "-> staff 체크로 진행",
                );
              }

              // owner 프로필이 없으면 staff로 시도
              try {
                await api.get("mypage/staff/profile");
                console.log("알바생 프로필 확인 성공 -> /employee로 이동");
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname,
                );
                navigate("/employee");
                return;
              } catch (staffError) {
                const staffStatus = staffError.response?.status;
                console.log("staff 프로필 조회 실패:", staffStatus);

                // 둘 다 실패하면 정보 미등록으로 간주
                console.log("프로필 확인 실패 -> 온보딩으로 이동");
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname,
                );
                navigate("/onboarding");
                return;
              }
            }
          } else {
            // 활성 매장이 없으면 정보 미등록 -> 온보딩으로 이동
            console.log("활성 매장 없음 -> 온보딩으로 이동");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
            navigate("/onboarding");
            return;
          }
        } catch (storeError) {
          // 활성 매장 조회 실패 (404 등) -> 정보 미등록으로 간주
          console.log(
            "활성 매장 조회 실패 (정보 미등록) -> 온보딩으로 이동:",
            storeError.response?.status,
          );
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          navigate("/onboarding");
          return;
        }
      } catch (err) {
        // 에러 상세 정보 로깅
        console.error("카카오 로그인 처리 에러:", err);
        console.error("에러 상세:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        navigate("/login?error=kakao_login_failed");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="w-full h-screen bg-white flex flex-col justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <p className="text-center">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default KakaoCallback;
