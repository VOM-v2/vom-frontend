import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VomButton from '../components/VomButton';
import VomInput from '../components/VomInput';
import { buildBackendUrl } from '../config/backend';
import { getXsrfToken } from '../utils/cookies';
import { getUserIdFromToken, getAccessToken, getNickname, clearAuth, setAuthFromResponse } from '../utils/authStorage';
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

const MOCK_PROFILE = {
  name: '봄봄이',
  avatarUrl:
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  bomBomCount: 12,
  intro: '오늘도 VOM에서 새로운 인연 기다리는 중 ✿',
  introPlaceholder: '자기소개를 작성해보세요!',
  interestIds: [1, 7, 12],
};

/** 스냅 목록 초기값 (백엔드 GET /api/snaps/me 또는 /api/snaps?userId= 연동 후 교체) */
const MOCK_SNAPS = [
  {
    id: '1',
    content: '오늘 새 키보드로 밤새 코딩 💻',
    imageUrl:
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: '2025-02-18T12:00:00',
  },
  {
    id: '2',
    content: '카페에서 사이드 프로젝트 구상 중 ☕',
    imageUrl:
      'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: '2025-02-17T15:30:00',
  },
];

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
  const pageNickname = params.nickname ? decodeURIComponent(params.nickname) : null;
  const currentUserNickname = getNickname();
  const isMyAccount = !pageNickname || pageNickname === currentUserNickname;

  // /mini-home 으로 들어온 경우 본인 닉네임으로 URL 교체
  useEffect(() => {
    if (pageNickname == null && currentUserNickname) {
      navigate(`/mini-home/${encodeURIComponent(currentUserNickname)}`, { replace: true });
    }
  }, [pageNickname, currentUserNickname, navigate]);

  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [snaps, setSnaps] = useState(MOCK_SNAPS);
  const [newSnapContent, setNewSnapContent] = useState('');
  const [newSnapImage, setNewSnapImage] = useState(null);
  const [isNewSnapOpen, setIsNewSnapOpen] = useState(false);
  const [snapSubmitError, setSnapSubmitError] = useState(null);
  const [isSnapSubmitting, setIsSnapSubmitting] = useState(false);
  const [newlyAddedIds, setNewlyAddedIds] = useState(new Set());

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
          imageUrl: raw.imageUrl ?? raw.imageURL ?? raw.image_url ?? '',
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

  const handleSaveProfile = () => {
    // TODO: 실제 백엔드 연동 시, 아래와 같이 관심 키워드를 아이디 배열로 전송
    // const payload = {
    //   name: profile.name,
    //   avatarUrl: profile.avatarUrl,
    //   intro: profile.intro,
    //   interestIds: profile.interestIds, // 예: [1, 2, 3]
    // };
    // await fetch(buildBackendUrl('/api/profile'), { ...payload });

    // eslint-disable-next-line no-console
    console.log('[vom] profile update payload (preview)', {
      ...profile,
      interestIds: interestIdsForBackend,
    });
    setIsEditOpen(false);
  };

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

            {snaps.length === 0 ? (
              <p className="vomMiniHome__snapEmpty">
                아직 스냅이 없어요. 첫 스냅을 남겨보세요!
              </p>
            ) : (
              <div className="vomMiniHome__snapGrid">
                {snaps.map((snap) => (
                  <article
                    className={`vomMiniHome__snapCard ${
                      newlyAddedIds.has(snap.id) ? 'vomMiniHome__snapCard--develop' : ''
                    }`}
                    key={snap.id}
                  >
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
            )}
          </section>
        </div>

        <aside
          className={`vomMiniHome__editDrawer ${
            isEditOpen ? 'isOpen' : 'isClosed'
          }`}
          aria-hidden={!isEditOpen}
        >
          <div className="vomMiniHome__editInner">
            <header className="vomMiniHome__editHeader">
              <span className="vomMiniHome__sectionTitle">프로필 수정</span>
              <button
                type="button"
                className="vomMiniHome__editClose"
                onClick={() => setIsEditOpen(false)}
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
                  placeholder="미니홈피 이름"
                />
              </div>

              <div className="vomMiniHome__editField">
                <VomInput
                  label="프로필 사진 URL"
                  value={profile.avatarUrl}
                  onChange={handleProfileFieldChange('avatarUrl')}
                  placeholder="이미지 URL을 입력해주세요"
                />
                <p className="vomMiniHome__editHint">
                  (임시 구현) 이미지 업로드 대신 URL을 입력해서 변경합니다.
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
                    <div
                      className="vomMiniHome__categoryGroup"
                      key={cat.key}
                    >
                      <div className="vomMiniHome__categoryHeader">
                        <span
                          className={`vomMiniHome__categoryBadge ${cat.colorClass}`}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <div className="vomMiniHome__pillRow">
                        {cat.keywords.map((k) => {
                          const selected = profile.interestIds.includes(k.id);
                          const disabled =
                            !selected &&
                            profile.interestIds.length >= MAX_INTERESTS;
                          return (
                            <button
                              key={k.id}
                              type="button"
                              className={`vomMiniHome__chip ${
                                selected ? 'isSelected' : ''
                              } ${disabled ? 'isDisabled' : ''}`}
                              onClick={() =>
                                !disabled && handleToggleInterest(k.id)
                              }
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
                  <br />
                  실제 백엔드에는{' '}
                  <code>[{interestIdsForBackend.join(', ')}]</code>처럼 아이디
                  배열로 전달됩니다.
                </p>
              </div>
            </div>

            <footer className="vomMiniHome__editFooter">
              <VomButton
                variant="secondary"
                className="vomMiniHome__editFooterBtn"
                onClick={() => setIsEditOpen(false)}
              >
                취소
              </VomButton>
              <VomButton
                variant="primary"
                className="vomMiniHome__editFooterBtn"
                onClick={handleSaveProfile}
              >
                저장하기
              </VomButton>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MiniHomePage;

