import React, { useMemo, useState } from 'react';
import VomButton from '../components/VomButton';
import VomInput from '../components/VomInput';
import './MiniHomePage.css';

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
const MAX_FEED_IMAGES = 5;

const MOCK_PROFILE = {
  name: '봄봄이',
  avatarUrl:
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  bomBomCount: 12,
  intro: '오늘도 VOM에서 새로운 인연 기다리는 중 ✿',
  introPlaceholder: '자기소개를 작성해보세요!',
  interestIds: [1, 7, 12],
};

const MOCK_FEEDS = [
  {
    id: 1,
    authorName: '봄봄이',
    createdAt: '방금 전',
    content: '오늘 새로 산 키보드로 밤새 코딩했어요 💻',
    photos: [
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
  },
  {
    id: 2,
    authorName: '봄봄이',
    createdAt: '어제',
    content: '카페에서 사이드 프로젝트 구상 중 ☕',
    photos: [
      'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
  },
];

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

  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [feeds, setFeeds] = useState(MOCK_FEEDS);
  const [newFeedContent, setNewFeedContent] = useState('');
  const [newFeedImages, setNewFeedImages] = useState([]);
  const [isNewFeedOpen, setIsNewFeedOpen] = useState(false);

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

  const handleNewFeedImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const limitedFiles = files.slice(0, MAX_FEED_IMAGES);
    const previews = limitedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewFeedImages(previews);
  };

  const handleCreateFeed = (e) => {
    e.preventDefault();
    if (!newFeedContent.trim() && newFeedImages.length === 0) return;

    const nextFeed = {
      id: Date.now(),
      authorName: profile.name || MOCK_PROFILE.name,
      createdAt: '방금 전',
      content: newFeedContent.trim(),
      photos: newFeedImages.map((img) => img.previewUrl),
    };

    setFeeds((prev) => [nextFeed, ...prev]);
    setNewFeedContent('');
    setNewFeedImages([]);

    // TODO: 백엔드 연동 시 여기에서 실제 업로드 API 호출
  };

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
                      onClick={() => {
                        // TODO: 실제 로그아웃 API 연동 시 교체
                        // eslint-disable-next-line no-console
                        console.log('[vom] logout clicked');
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

            <div className="vomMiniHome__newFeedWrapper">
              <div className="vomMiniHome__sectionHeader">
                <span className="vomMiniHome__sectionTitle">새 피드</span>
                <span className="vomMiniHome__sectionHint">
                  사진은 최대 {MAX_FEED_IMAGES}장까지 등록할 수 있어요
                </span>
              </div>

              {!isNewFeedOpen ? (
                <div className="vomMiniHome__newFeedClosed">
                  <VomButton
                    variant="primary"
                    className="vomMiniHome__newFeedToggleBtn"
                    onClick={() => setIsNewFeedOpen(true)}
                  >
                    피드 추가
                  </VomButton>
                </div>
              ) : (
                <form
                  className="vomMiniHome__newFeed"
                  onSubmit={(e) => {
                    handleCreateFeed(e);
                    setIsNewFeedOpen(false);
                  }}
                >
                  <textarea
                    className="vomMiniHome__newFeedTextarea"
                    placeholder="오늘 있었던 일을 짧게 남겨보세요 ✎"
                    value={newFeedContent}
                    onChange={(e) => setNewFeedContent(e.target.value)}
                  />

                  <div className="vomMiniHome__newFeedControls">
                    <label className="vomMiniHome__fileLabel">
                      사진 선택
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewFeedImagesChange}
                      />
                    </label>
                    <span className="vomMiniHome__fileHint">
                      선택된 사진 {newFeedImages.length}/{MAX_FEED_IMAGES}
                    </span>
                  </div>

                  {newFeedImages.length > 0 && (
                    <div className="vomMiniHome__newFeedPreviewRow">
                      {newFeedImages.map((img, idx) => (
                        <div
                          className="vomMiniHome__newFeedPreview"
                          key={img.previewUrl || idx}
                        >
                          <img src={img.previewUrl} alt="새 피드 미리보기" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="vomMiniHome__newFeedFooter">
                    <VomButton
                      type="button"
                      variant="secondary"
                      className="vomMiniHome__newFeedCancelBtn"
                      onClick={() => {
                        setIsNewFeedOpen(false);
                        setNewFeedContent('');
                        setNewFeedImages([]);
                      }}
                    >
                      취소
                    </VomButton>
                    <VomButton
                      type="submit"
                      variant="primary"
                      className="vomMiniHome__newFeedBtn"
                      disabled={
                        !newFeedContent.trim() && newFeedImages.length === 0
                      }
                    >
                      피드 등록하기
                    </VomButton>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section className="vomMiniHome__right">
            <div className="vomMiniHome__sectionHeader">
              <span className="vomMiniHome__sectionTitle">피드</span>
              <span className="vomMiniHome__sectionHint">
                사진 1~{MAX_FEED_IMAGES}장과 내용말로 구성돼요
              </span>
            </div>

            {feeds.length === 0 ? (
              <p className="vomMiniHome__feedEmpty">
                아직 올라온 피드가 없어요. 첫 번째 피드를 남겨보세요!
              </p>
            ) : (
              <div className="vomMiniHome__feedList">
                {feeds.map((feed) => (
                  <article className="vomMiniHome__feedItem" key={feed.id}>
                    <header className="vomMiniHome__feedHeader">
                      <div className="vomMiniHome__feedAuthorAvatar">
                        <img src={profile.avatarUrl} alt="" />
                      </div>
                      <div className="vomMiniHome__feedAuthorMeta">
                        <span className="vomMiniHome__feedAuthorName">
                          {feed.authorName}
                        </span>
                        <span className="vomMiniHome__feedTime">
                          {feed.createdAt}
                        </span>
                      </div>
                    </header>

                    {feed.photos?.length ? (
                      <div className="vomMiniHome__feedPhotos">
                        {feed.photos.slice(0, MAX_FEED_IMAGES).map((url, i) => (
                          <div
                            className="vomMiniHome__feedPhoto"
                            key={`${feed.id}-${i}`}
                          >
                            <img src={url} alt={`피드 사진 ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {feed.content ? (
                      <p className="vomMiniHome__feedContent">{feed.content}</p>
                    ) : null}
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

