import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VomButton from '../components/VomButton';
import VomInput from '../components/VomInput';
import { buildBackendUrl } from '../config/backend';
import { getXsrfToken } from '../utils/cookies';
import { getUserIdFromToken, getAccessToken, clearAuth, setAuthFromResponse } from '../utils/authStorage';
import './MiniHomePage.css';

const MAX_SNAP_CONTENT = 20;

/** 현재 로그인 사용자 ID (JWT payload에서 디코딩). 없으면 개발용 폴백 */
function getCurrentUserId() {
  return getUserIdFromToken() || '00000000-0000-0000-0000-000000000001';
}

const INTEREST_CATEGORIES = [
  {
    key: 'DIGITAL',
    label: 'DIGITAL',
    colorClass: 'isDigital',
    keywords: [
      { id: 1, label: '게임' },
      { id: 2, label: '프로그래밍' },
      { id: 3, label: 'AI' },
      { id: 4, label: '유튜브' },
      { id: 5, label: '웹툰' },
    ],
  },
  {
    key: 'CREATIVE',
    label: 'CREATIVE',
    colorClass: 'isCreative',
    keywords: [
      { id: 6, label: '그림' },
      { id: 7, label: '글쓰기' },
      { id: 8, label: '음악감상' },
      { id: 9, label: '악기연주' },
      { id: 10, label: '영화' },
    ],
  },
  {
    key: 'LIFESTYLE',
    label: 'LIFESTYLE',
    colorClass: 'isLifestyle',
    keywords: [
      { id: 11, label: '운동' },
      { id: 12, label: '여행' },
      { id: 13, label: '카페' },
      { id: 14, label: '요리' },
      { id: 15, label: '반려동물' },
    ],
  },
  {
    key: 'HOBBY',
    label: 'HOBBY',
    colorClass: 'isHobby',
    keywords: [
      { id: 16, label: '사진' },
      { id: 17, label: '독서' },
      { id: 18, label: '등산' },
      { id: 19, label: '캠핑' },
      { id: 20, label: '산책' },
    ],
  },
  {
    key: 'MUSIC',
    label: 'MUSIC',
    colorClass: 'isMusic',
    keywords: [
      { id: 21, label: 'K-POP' },
      { id: 22, label: '힙합' },
      { id: 23, label: '인디' },
      { id: 24, label: '재즈' },
      { id: 25, label: '록' },
    ],
  },
  {
    key: 'LEARNING',
    label: 'LEARNING',
    colorClass: 'isLearning',
    keywords: [
      { id: 26, label: '외국어' },
      { id: 27, label: '재테크' },
      { id: 28, label: '자기계발' },
      { id: 29, label: '명상' },
    ],
  },
];

const MAX_INTERESTS = 5;

/** 백엔드 Gender enum과 동일 */
const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'OTHER', label: '기타' },
];

const MOCK_PROFILE = {
  name: '봄봄이',
  avatarUrl:
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  bomBomCount: 12,
  intro: '오늘도 VOM에서 새로운 인연 기다리는 중 ✿',
  introPlaceholder: '자기소개를 작성해보세요!',
  interestIds: [1, 7, 12],
  gender: 'FEMALE',
  birthDate: '1995-03-15',
};

/** 스냅 이미지 없을 때만 사용하는 중립 플레이스홀더 (회색 박스, 잘못된 이미지 노출 방지) */
const SNAP_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3E이미지 없음%3C/text%3E%3C/svg%3E";

const SNAP_PAGE_SIZE = 50;

function formatDateBack(dateStr) {
  try {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  } catch (_) {
    return '';
  }
}

function useInterestHelpers() {
  const flatKeywords = useMemo(
    () => INTEREST_CATEGORIES.flatMap((c) => c.keywords),
    []
  );

  const getLabelById = (id) =>
    flatKeywords.find((k) => k.id === id)?.label ?? `#${id}`;

  return { flatKeywords, getLabelById };
}

const MiniHomePage = () => {
  const { flatKeywords, getLabelById } = useInterestHelpers();
  const params = useParams();
  const navigate = useNavigate();
  const pageUserId = params.userId ? decodeURIComponent(params.userId) : null;
  const currentUserId = getUserIdFromToken();
  // '내 미니홈피' 판단: JWT의 sub(또는 userId)와 URL의 userId 비교. localStorage에 UUID 따로 저장하지 않고 토큰에서만 사용 (권장).
  // UUID 문자열은 대소문자 차이로 불일치할 수 있으므로 소문자로 정규화해 비교.
  const isMyAccount = (() => {
    if (!pageUserId) return true;
    if (!currentUserId) return false;
    const a = String(pageUserId).toLowerCase().trim();
    const b = String(currentUserId).toLowerCase().trim();
    return a === b;
  })();

  // /mini-home 으로 들어온 경우 본인 userId로 URL 교체
  useEffect(() => {
    if (pageUserId == null && currentUserId) {
      navigate(`/mini-home/${encodeURIComponent(currentUserId)}`, { replace: true });
    }
  }, [pageUserId, currentUserId, navigate]);

  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [snaps, setSnaps] = useState([]);
  const [snapNextCursor, setSnapNextCursor] = useState(null);
  const [snapHasNext, setSnapHasNext] = useState(false);
  const [isLoadingSnaps, setIsLoadingSnaps] = useState(false);
  const [snapLoadError, setSnapLoadError] = useState(null);
  const [newSnapContent, setNewSnapContent] = useState('');
  const [newSnapImage, setNewSnapImage] = useState(null);
  const [isNewSnapOpen, setIsNewSnapOpen] = useState(false);
  const [snapSubmitError, setSnapSubmitError] = useState(null);
  const [isSnapSubmitting, setIsSnapSubmitting] = useState(false);
  const [newlyAddedIds, setNewlyAddedIds] = useState(new Set());
  const [snapDeleteError, setSnapDeleteError] = useState(null);
  const [deletingSnapId, setDeletingSnapId] = useState(null);
  const [deleteConfirmSnapId, setDeleteConfirmSnapId] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState(null);

  const targetUserId = pageUserId || currentUserId;

  const fetchSnapsByUserId = useCallback(
    async (userId, cursor = null, append = false) => {
      if (!userId) return;
      const params = new URLSearchParams();
      params.set('userId', userId);
      if (cursor != null && cursor !== '') params.set('cursor', String(cursor));
      params.set('page', '0');
      params.set('size', String(SNAP_PAGE_SIZE));
      params.set('sort', 'createdAt,desc');
      const url = `${buildBackendUrl('/api/snaps')}?${params.toString()}`;
      const token = getAccessToken();
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors',
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `스냅 목록 조회 실패 (${response.status})`);
      }
      const data = await response.json();
      const list = (data.content || []).map((item) => ({
        id: item.id,
        content: item.content ?? '',
        createdAt: item.createdAt,
        user: item.user,
        imageUrl: item.snapImageUrl ?? item.imageUrl ?? SNAP_IMAGE_PLACEHOLDER,
      }));
      if (append) {
        setSnaps((prev) => [...prev, ...list]);
      } else {
        setSnaps(list);
      }
      setSnapNextCursor(data.nextCursor ?? null);
      setSnapHasNext(Boolean(data.hasNext));
      return data;
    },
    []
  );

  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;
    setIsLoadingSnaps(true);
    setSnapLoadError(null);
    fetchSnapsByUserId(targetUserId, null, false)
      .then(() => {
        if (!cancelled) setSnapLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setSnapLoadError(err?.message || '스냅 목록을 불러오지 못했어요.');
          setSnaps([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSnaps(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId, fetchSnapsByUserId]);

  useEffect(() => {
    if (newlyAddedIds.size === 0) return;
    const t = setTimeout(() => {
      setNewlyAddedIds(new Set());
    }, 3200);
    return () => clearTimeout(t);
  }, [newlyAddedIds]);

  const selectedInterests = useMemo(
    () => flatKeywords.filter((k) => profile.interestIds.includes(k.id)),
    [flatKeywords, profile.interestIds]
  );

  const interestIdsForBackend = profile.interestIds;

  const handleToggleInterest = (id) => {
    setProfile((prev) => {
      const exists = prev.interestIds.includes(id);
      if (exists) {
        return {
          ...prev,
          interestIds: prev.interestIds.filter((v) => v !== id),
        };
      }
      if (prev.interestIds.length >= MAX_INTERESTS) {
        return prev;
      }
      return {
        ...prev,
        interestIds: [...prev.interestIds, id],
      };
    });
  };

  const handleProfileFieldChange = (field) => (e) => {
    const value = e.target.value;
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewSnapImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setNewSnapImage(null);
      return;
    }
    setNewSnapImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleCreateSnap = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newSnapImage?.file) return;
      const content = newSnapContent.trim().slice(0, MAX_SNAP_CONTENT);

      setSnapSubmitError(null);
      setIsSnapSubmitting(true);

      try {
        const xsrfToken = await getXsrfToken();
        const url = buildBackendUrl('/api/snaps/me');
        const formData = new FormData();
        const request = { content: content || null };
        formData.append(
          'request',
          new Blob([JSON.stringify(request)], { type: 'application/json' })
        );
        formData.append('image', newSnapImage.file);

        const headers = {};
        const accessToken = getAccessToken();
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;

        let response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include',
          mode: 'cors',
        });

        if (response.status === 401) {
          const refreshRes = await fetch(buildBackendUrl('/api/auth/refresh'), {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
          });
          if (refreshRes.ok) {
            try {
              const refreshData = await refreshRes.json();
              setAuthFromResponse(refreshData);
              const newToken = refreshData?.accessToken ?? getAccessToken();
              if (newToken) {
                headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: formData,
                  credentials: 'include',
                  mode: 'cors',
                });
              }
            } catch (_) {
              // ignore
            }
          }
        }

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let message = '스냅 등록에 실패했어요.';
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json().catch(() => ({}));
            message = data?.message || data?.error || message;
          }
          setSnapSubmitError(message);
          return;
        }

        const raw = await response.json();
        const created = {
          id: raw.id,
          content: raw.content ?? '',
          imageUrl:
            raw.snapImageUrl ?? raw.imageUrl ?? raw.imageURL ?? raw.image_url ?? SNAP_IMAGE_PLACEHOLDER,
          createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
        };
        setSnaps((prev) => [created, ...prev]);
        setNewlyAddedIds((prev) => new Set(prev).add(created.id));
        setNewSnapContent('');
        setNewSnapImage((prev) => {
          if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
          return null;
        });
        setIsNewSnapOpen(false);
      } catch (err) {
        setSnapSubmitError(err?.message || '스냅 등록 중 오류가 났어요.');
      } finally {
        setIsSnapSubmitting(false);
      }
    },
    [newSnapContent, newSnapImage]
  );

  const handleDeleteSnapClick = useCallback((snapId) => {
    setDeleteConfirmSnapId(snapId);
  }, []);

  const handleDeleteSnapConfirm = useCallback(async () => {
    const snapId = deleteConfirmSnapId;
    if (!snapId) return;
    setDeleteConfirmSnapId(null);
    setSnapDeleteError(null);
    setDeletingSnapId(snapId);
    const url = buildBackendUrl(`/api/snaps/${snapId}`);
    const doDelete = async (token) => {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      try {
        const xsrfToken = await getXsrfToken();
        if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
      } catch (_) {
        // optional
      }
      return fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        mode: 'cors',
      });
    };
    try {
      let response = await doDelete(getAccessToken());
      if (response.status === 401) {
        const refreshRes = await fetch(buildBackendUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          mode: 'cors',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json().catch(() => ({}));
          setAuthFromResponse(refreshData);
          response = await doDelete(refreshData?.accessToken ?? getAccessToken());
        }
      }
      if (response.status === 204 || response.status === 200) {
        setSnaps((prev) => prev.filter((s) => String(s.id) !== String(snapId)));
        return;
      }
      const contentType = response.headers.get('content-type');
      let message = '스냅 삭제에 실패했어요.';
      if (response.status === 403) message = '본인 스냅만 삭제할 수 있어요.';
      else if (contentType && contentType.includes('application/json')) {
        const data = await response.json().catch(() => ({}));
        message = data?.message ?? data?.error ?? message;
      }
      setSnapDeleteError(message);
    } catch (err) {
      setSnapDeleteError(err?.message || '스냅 삭제 중 오류가 났어요.');
    } finally {
      setDeletingSnapId(null);
    }
  }, [deleteConfirmSnapId]);

  const handleDeleteSnapCancel = useCallback(() => {
    setDeleteConfirmSnapId(null);
  }, []);

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    setProfileImageFile(file ? { file } : null);
  };

  const handleSaveProfile = useCallback(async () => {
    setProfileSaveError(null);
    setIsProfileSaving(true);

    try {
      const name = profile.name?.trim() ?? '';
      const gender = profile.gender ?? 'MALE';
      const birthDate = profile.birthDate ?? '';

      if (name.length < 2 || name.length > 20) {
        setProfileSaveError('사용자 이름은 2자 이상 20자 이하여야 합니다.');
        setIsProfileSaving(false);
        return;
      }
      if (!birthDate) {
        setProfileSaveError('생년월일을 입력해주세요.');
        setIsProfileSaving(false);
        return;
      }

      const xsrfToken = await getXsrfToken();
      const url = buildBackendUrl('/api/profiles/me');
      const formData = new FormData();
      const request = {
        name,
        gender,
        birthDate,
        intro: profile.intro?.trim() || null,
        interestIds: interestIdsForBackend,
      };
      formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
      if (profileImageFile?.file) {
        formData.append('image', profileImageFile.file);
      }

      const headers = {};
      const accessToken = getAccessToken();
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;

      let response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (response.status === 401) {
        const refreshRes = await fetch(buildBackendUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          mode: 'cors',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setAuthFromResponse(refreshData);
          const newToken = refreshData?.accessToken ?? getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
              method: 'PATCH',
              headers,
              body: formData,
              credentials: 'include',
              mode: 'cors',
            });
          }
        }
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let message = '프로필 저장에 실패했어요.';
        if (contentType?.includes('application/json')) {
          const data = await response.json().catch(() => ({}));
          message = data?.message || data?.error || message;
        }
        setProfileSaveError(message);
        return;
      }

      const data = await response.json();
      setProfile((prev) => ({
        ...prev,
        name: data.name ?? prev.name,
        gender: data.gender ?? prev.gender,
        birthDate: data.birthDate ?? prev.birthDate,
        intro: data.intro ?? prev.intro,
        avatarUrl: data.avatarUrl ?? data.profileImageUrl ?? prev.avatarUrl,
        interestIds: data.interestIds ?? prev.interestIds,
      }));
      setProfileImageFile(null);
      setIsEditOpen(false);
    } catch (err) {
      setProfileSaveError(err?.message || '프로필 저장 중 오류가 났어요.');
    } finally {
      setIsProfileSaving(false);
    }
  }, [profile.name, profile.gender, profile.birthDate, profile.intro, interestIdsForBackend, profileImageFile]);

  return (
    <div className="vom-page">
      <div className="vomMiniHome">
        <div className="vomMiniHome__header">
          <div className="vom-logo" aria-hidden="true">
            <span className="vom-logo__text">V</span>
          </div>
          <div className="vomMiniHome__titles">
            <h1 className="vomMiniHome__title">VOM 미니홈피</h1>
            <p className="vomMiniHome__subtitle">
              레트로 감성으로 나만의 공간을 꾸며보세요 ✿
            </p>
          </div>
        </div>

        <div className="vomMiniHome__layout">
          <section className="vomMiniHome__left">
            <div className="vomMiniHome__profileCard">
              <div className="vomMiniHome__profileMain">
                <div className="vomMiniHome__avatarWrap">
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.name}의 프로필`}
                    className="vomMiniHome__avatar"
                  />
                </div>

                <div className="vomMiniHome__profileMeta">
                  <div className="vomMiniHome__nameRow">
                    <span className="vomMiniHome__name">{profile.name}</span>
                    <span className="vomMiniHome__bomBomBadge">
                      봄봄 수&nbsp;
                      <strong>{profile.bomBomCount}</strong>
                    </span>
                  </div>

                  <p className="vomMiniHome__intro">
                    {profile.intro || profile.introPlaceholder}
                  </p>

                  <div className="vomMiniHome__actions">
                    <VomButton
                      variant="secondary"
                      className="vomMiniHome__touchBtn"
                    >
                      터치포인트 보내기 ✦
                    </VomButton>
                    <VomButton
                      variant="secondary"
                      className="vomMiniHome__editBtn"
                      onClick={() => setIsEditOpen(true)}
                    >
                      프로필 수정
                    </VomButton>
                    <VomButton
                      variant="secondary"
                      className="vomMiniHome__logoutBtn"
                      onClick={async () => {
                        try {
                          const url = buildBackendUrl('/api/auth/sign-out');
                          const token = getAccessToken();
                          const headers = {};
                          if (token) headers['Authorization'] = `Bearer ${token}`;
                          await fetch(url, {
                            method: 'POST',
                            headers,
                            credentials: 'include',
                            mode: 'cors',
                          });
                        } catch (_) {
                          // ignore
                        }
                        clearAuth();
                        window.location.href = '/sign-in';
                      }}
                    >
                      로그아웃
                    </VomButton>
                  </div>
                </div>
              </div>

              <div className="vomMiniHome__interests">
                <div className="vomMiniHome__interestsHeader">
                  <span className="vomMiniHome__sectionTitle">관심 키워드</span>
                  <span className="vomMiniHome__chipHelper">
                    선택 {selectedInterests.length}/{MAX_INTERESTS}
                  </span>
                </div>
                {selectedInterests.length === 0 ? (
                  <p className="vomMiniHome__interestsEmpty">
                    아직 관심 키워드가 없어요. 프로필 수정에서 추가해보세요!
                  </p>
                ) : (
                  <div className="vomMiniHome__pillRow">
                    {selectedInterests.map((k) => (
                      <span
                        key={k.id}
                        className="vomMiniHome__chip vomMiniHome__chip--selected"
                      >
                        #{k.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isMyAccount && (
              <div className="vomMiniHome__newSnapWrapper">
                <div className="vomMiniHome__sectionHeader">
                  <span className="vomMiniHome__sectionTitle">새 스냅</span>
                  <span className="vomMiniHome__sectionHint">
                    사진 1장 + 한 줄 메모 (최대 {MAX_SNAP_CONTENT}자)
                  </span>
                </div>

                {!isNewSnapOpen ? (
                  <div className="vomMiniHome__newSnapClosed">
                    <VomButton
                      variant="primary"
                      className="vomMiniHome__newSnapToggleBtn"
                      onClick={() => setIsNewSnapOpen(true)}
                    >
                      스냅 추가
                    </VomButton>
                  </div>
                ) : (
                  <form
                    className="vomMiniHome__newSnap"
                    onSubmit={handleCreateSnap}
                  >
                    <div className="vomMiniHome__newSnapControls">
                      <label className="vomMiniHome__fileLabel">
                        사진 1장 선택
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewSnapImageChange}
                        />
                      </label>
                      {newSnapImage && (
                        <div className="vomMiniHome__newSnapPreview">
                          <img src={newSnapImage.previewUrl} alt="스냅 미리보기" />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      className="vomMiniHome__newSnapMemo"
                      placeholder="한 줄 메모 (최대 20자)"
                      maxLength={MAX_SNAP_CONTENT}
                      value={newSnapContent}
                      onChange={(e) => setNewSnapContent(e.target.value)}
                    />
                    <span className="vomMiniHome__newSnapCount">
                      {newSnapContent.length}/{MAX_SNAP_CONTENT}
                    </span>
                    {snapSubmitError && (
                      <p className="vomMiniHome__newSnapError" role="alert">
                        {snapSubmitError}
                      </p>
                    )}
                    <div className="vomMiniHome__newSnapFooter">
                      <VomButton
                        type="button"
                        variant="secondary"
                        className="vomMiniHome__newSnapCancelBtn"
                        onClick={() => {
                          setIsNewSnapOpen(false);
                          setNewSnapContent('');
                          setNewSnapImage((prev) => {
                            if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
                            return null;
                          });
                          setSnapSubmitError(null);
                        }}
                      >
                        취소
                      </VomButton>
                      <VomButton
                        type="submit"
                        variant="primary"
                        className="vomMiniHome__newSnapBtn"
                        disabled={!newSnapImage?.file || isSnapSubmitting}
                      >
                        {isSnapSubmitting ? '등록 중…' : '스냅 등록하기'}
                      </VomButton>
                    </div>
                  </form>
                )}
              </div>
            )}
          </section>

          <section className="vomMiniHome__right">
            <div className="vomMiniHome__sectionHeader">
              <span className="vomMiniHome__sectionTitle">스냅 앨범</span>
              <span className="vomMiniHome__sectionHint">
                사진 1장 + 한 줄 메모, 수정 불가
              </span>
            </div>

            {snapLoadError && (
              <p className="vomMiniHome__snapError" role="alert">
                {snapLoadError}
              </p>
            )}
            {snapDeleteError && (
              <p className="vomMiniHome__snapError" role="alert">
                {snapDeleteError}
              </p>
            )}
            {isLoadingSnaps && snaps.length === 0 ? (
              <p className="vomMiniHome__snapEmpty">스냅을 불러오는 중…</p>
            ) : snaps.length === 0 ? (
              <p className="vomMiniHome__snapEmpty">
                아직 스냅이 없어요. 첫 스냅을 남겨보세요!
              </p>
            ) : (
              <>
                <div className="vomMiniHome__snapGrid">
                  {snaps.map((snap) => (
                  <article
                    className={`vomMiniHome__snapCard ${
                      newlyAddedIds.has(snap.id) ? 'vomMiniHome__snapCard--develop' : ''
                    }`}
                    key={snap.id}
                  >
                    {isMyAccount && (
                      <button
                        type="button"
                        className="vomMiniHome__snapCardDelete"
                        onClick={() => handleDeleteSnapClick(snap.id)}
                        disabled={deletingSnapId === snap.id || deleteConfirmSnapId !== null}
                        title="스냅 삭제"
                        aria-label="스냅 삭제"
                      >
                        {deletingSnapId === snap.id ? '삭제 중…' : '삭제'}
                      </button>
                    )}
                    <div className="vomMiniHome__snapPolaroid">
                      <div className="vomMiniHome__snapPhotoWrap">
                        <img
                          src={snap.imageUrl}
                          alt=""
                          className="vomMiniHome__snapPhoto"
                        />
                      </div>
                      <p className="vomMiniHome__snapMemo">
                        {snap.content || '\u00A0'}
                      </p>
                      <span className="vomMiniHome__snapDateBack" aria-hidden="true">
                        {formatDateBack(snap.createdAt)}
                      </span>
                    </div>
                  </article>
                ))}
                </div>
                {snapHasNext && (
                  <div className="vomMiniHome__snapMore">
                    <VomButton
                      variant="secondary"
                      disabled={isLoadingSnaps}
                      onClick={() => {
                        if (!targetUserId || snapNextCursor == null) return;
                        setIsLoadingSnaps(true);
                        setSnapLoadError(null);
                        fetchSnapsByUserId(targetUserId, snapNextCursor, true)
                          .catch((err) => {
                            setSnapLoadError(err?.message || '다음 스냅을 불러오지 못했어요.');
                          })
                          .finally(() => setIsLoadingSnaps(false));
                      }}
                    >
                      {isLoadingSnaps ? '불러오는 중…' : '더 보기'}
                    </VomButton>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {isEditOpen && (
          <div
            className="vomMiniHome__editModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div
              className="vomMiniHome__editModalBackdrop"
              onClick={() => {
                setIsEditOpen(false);
                setProfileSaveError(null);
                setProfileImageFile(null);
              }}
            />
            <div className="vomMiniHome__editInner">
            <header className="vomMiniHome__editHeader">
              <h2 id="edit-modal-title" className="vomMiniHome__sectionTitle">프로필 수정</h2>
              <button
                type="button"
                className="vomMiniHome__editClose"
                onClick={() => {
                  setIsEditOpen(false);
                  setProfileSaveError(null);
                  setProfileImageFile(null);
                }}
              >
                ✕
              </button>
            </header>

            <div className="vomMiniHome__editBody">
              <div className="vomMiniHome__editField">
                <VomInput
                  label="이름"
                  value={profile.name}
                  onChange={handleProfileFieldChange('name')}
                  placeholder="미니홈피 이름 (2~20자)"
                />
                <p className="vomMiniHome__editHint">
                  사용자 이름은 2자 이상 20자 이하여야 합니다.
                </p>
              </div>

              <div className="vomMiniHome__editField">
                <label className="vomMiniHome__editLabel">성별</label>
                <select
                  className="vomMiniHome__editSelect"
                  value={profile.gender ?? 'MALE'}
                  onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="vomMiniHome__editField">
                <label className="vomMiniHome__editLabel">생년월일</label>
                <input
                  type="date"
                  className="vomMiniHome__editInput"
                  value={profile.birthDate ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))}
                />
                <p className="vomMiniHome__editHint">
                  생년월일은 현재 또는 과거여야 합니다.
                </p>
              </div>

              <div className="vomMiniHome__editField">
                <label className="vomMiniHome__editLabel">자기소개글</label>
                <textarea
                  className="vomMiniHome__editTextarea"
                  value={profile.intro}
                  onChange={handleProfileFieldChange('intro')}
                  placeholder={profile.introPlaceholder}
                  rows={3}
                />
              </div>

              <div className="vomMiniHome__editField">
                <div className="vomMiniHome__editLabelRow">
                  <span className="vomMiniHome__editLabel">관심 키워드</span>
                  <span className="vomMiniHome__chipHelper">
                    선택 {profile.interestIds.length}/{MAX_INTERESTS}
                  </span>
                </div>
                <div className="vomMiniHome__categoryList">
                  {INTEREST_CATEGORIES.map((cat) => (
                    <div className="vomMiniHome__categoryGroup" key={cat.key}>
                      <div className="vomMiniHome__categoryHeader">
                        <span className={`vomMiniHome__categoryBadge ${cat.colorClass}`}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="vomMiniHome__pillRow">
                        {cat.keywords.map((k) => {
                          const selected = profile.interestIds.includes(k.id);
                          const disabled = !selected && profile.interestIds.length >= MAX_INTERESTS;
                          return (
                            <button
                              key={k.id}
                              type="button"
                              className={`vomMiniHome__chip ${selected ? 'isSelected' : ''} ${disabled ? 'isDisabled' : ''}`}
                              onClick={() => !disabled && handleToggleInterest(k.id)}
                            >
                              #{k.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="vomMiniHome__editHint">
                  관심 키워드는 최대 {MAX_INTERESTS}개까지 선택할 수 있어요.
                </p>
              </div>

              <div className="vomMiniHome__editField">
                <label className="vomMiniHome__editLabel">프로필 사진</label>
                <label className="vomMiniHome__fileLabel">
                  사진 선택
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </label>
                {profileImageFile && (
                  <p className="vomMiniHome__editHint">
                    선택된 파일: {profileImageFile.file.name}
                  </p>
                )}
                <p className="vomMiniHome__editHint">
                  변경하지 않으려면 선택하지 않으면 됩니다.
                </p>
              </div>

              {profileSaveError && (
                <p className="vomMiniHome__newSnapError" role="alert">
                  {profileSaveError}
                </p>
              )}
            </div>

            <footer className="vomMiniHome__editFooter">
              <VomButton
                variant="secondary"
                className="vomMiniHome__editFooterBtn"
                onClick={() => {
                  setIsEditOpen(false);
                  setProfileSaveError(null);
                  setProfileImageFile(null);
                }}
              >
                취소
              </VomButton>
              <VomButton
                variant="primary"
                className="vomMiniHome__editFooterBtn"
                onClick={handleSaveProfile}
                disabled={isProfileSaving}
              >
                {isProfileSaving ? '저장 중…' : '저장하기'}
              </VomButton>
            </footer>
          </div>
          </div>
        )}

        {deleteConfirmSnapId && (
          <div className="vomMiniHome__deleteModal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <div className="vomMiniHome__deleteModalBackdrop" onClick={handleDeleteSnapCancel} />
            <div className="vomMiniHome__deleteModalContent">
              <h2 id="delete-modal-title" className="vomMiniHome__deleteModalTitle">
                스냅 삭제
              </h2>
              <p className="vomMiniHome__deleteModalMessage">
                이 스냅을 삭제할까요? 삭제하면 복구할 수 없어요.
              </p>
              <div className="vomMiniHome__deleteModalActions">
                <VomButton
                  variant="secondary"
                  onClick={handleDeleteSnapCancel}
                  disabled={deletingSnapId !== null}
                >
                  취소
                </VomButton>
                <VomButton
                  variant="primary"
                  onClick={handleDeleteSnapConfirm}
                  disabled={deletingSnapId !== null}
                >
                  {deletingSnapId ? '삭제 중…' : '삭제하기'}
                </VomButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniHomePage;

