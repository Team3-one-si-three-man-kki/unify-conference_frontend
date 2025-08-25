// pages/Home/unicon_main.jsx - CSS 클래스 수정
import React, { useState, useEffect, useCallback } from 'react';
import styles from './main.module.css';

export const UniconMain = () => {
  // 통계 애니메이션을 위한 state
  const [stats, setStats] = useState({
    users: 0,
    stability: 0,
    support: 0,
    efficiency: 0
  });

  // CTA 이메일 입력을 위한 state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 통계 애니메이션 effect (더 부드럽게 개선)
  useEffect(() => {
    const animateCounter = (target, key, duration = 2000) => {
      let startTime;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart 이징 함수로 자연스러운 애니메이션
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = target * easeOutQuart;

        setStats(prev => ({ ...prev, [key]: currentValue }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // 각각 다른 딜레이로 시작해서 더 자연스럽게
    const timers = [
      setTimeout(() => animateCounter(10000, 'users'), 300),
      setTimeout(() => animateCounter(99.9, 'stability'), 500),
      setTimeout(() => animateCounter(24, 'support'), 700),
      setTimeout(() => animateCounter(50, 'efficiency'), 900)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  // 이벤트 핸들러들 (useCallback으로 최적화)
  const handleLogoClick = useCallback(() => {
    window.location.reload();
  }, []);

  const handleJoinClick = useCallback(() => {
    alert('회원가입 페이지로 이동 예정');
  }, []);

  const handleStartClick = useCallback(() => {
    console.log('시작하기 클릭');
    // TODO: 시작하기 로직
  }, []);

  const handleLearnMoreClick = useCallback(() => {
    console.log('서비스 알아보기 클릭');
    // TODO: 서비스 알아보기 로직
  }, []);

  const handleEmailSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    // 이메일 유효성 검사 추가
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Email submitted:', email);
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('등록이 완료되었습니다!');
      setEmail('');
    } catch (error) {
      console.error('Email submission error:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  // 통계 포맷팅 함수
  const formatStat = useCallback((value, type) => {
    switch(type) {
      case 'users': return Math.floor(value).toLocaleString() + '+';
      case 'stability': return value.toFixed(1) + '%';
      case 'support': return Math.floor(value) + '/7';
      case 'efficiency': return Math.floor(value) + '%';
      default: return value;
    }
  }, []);

  // 기능 데이터 구조화
  const features = [
    {
      iconClass: 'customIcon',
      title: '커스텀 UI',
      description: '원하는 대로 인터페이스를 바꾸어 나만의 편리한 환경을 구성할 수 있습니다.'
    },
    {
      iconClass: 'aiIcon',
      title: '졸음 AI',
      description: '실시간 졸음 감지로 집중력을 유지합니다.'
    },
    {
      iconClass: 'videoIcon',
      title: '영상통화',
      description: '고화질 영상으로 자연스러운 대면 소통 경험을 제공합니다.'
    },
    {
      iconClass: 'sharingIcon',
      title: '화면공유',
      description: '클릭 한 번으로 화면을 즉시 전송해 빠르고 효율적인 협업을 지원합니다.'
    },
    {
      iconClass: 'canvasIcon',
      title: '캔버스',
      description: '매끄러운 그래픽 처리로 몰입감 높은 시각 콘텐츠를 구현합니다.'
    },
    {
      iconClass: 'chatIcon',
      title: '채팅',
      description: '채팅을 통해 실시간 소통을 지원합니다.'
    }
  ];

  // 고객 후기 데이터 구조화
  const testimonials = [
    {
      text: "UniCon 도입 후 팀과의 커뮤니케이션이 획기적으로 개선되었습니다.",
      author: "김지훈",
      position: "네이버 CTO"
    },
    {
      text: "회의에 집중할 수 있게 되었고, 후처리 시간 없이 모든 회의 내용을 기록해줍니다.",
      author: "박서현",
      position: "삼성SDS 프로젝트 매니저"
    },
    {
      text: "보안이 엄격한 금융 산업에서도 안심하고 사용할 수 있습니다. 엔터프라이즈 보안과 암호화가 완벽 안전하다.",
      author: "이현준",
      position: "한국투자증권 IT 보안팀장"
    }
  ];

  return (
    <div className={styles.homePage}>
      {/* 고정 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <h1 className={styles.logo} onClick={handleLogoClick}>
            UniCon
          </h1>
          <nav className={styles.nav}>
            <button className={styles.joinButton} onClick={handleJoinClick}>
              회원가입
            </button>
          </nav>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.subtitle}>
            Unify + Conference = UniCon
          </div>

          <h1 className={styles.title}>
            비대면 UI 커스텀 <br />
            모듈 플랫폼
          </h1>

          <p className={styles.description}>
            언제 어디서나 모듈형 UI를 내 손 안에,
            간편한 설치와 즉시 사용으로 원격 협업을 혁신하세요.
          </p>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={handleStartClick}
            >
              시작하기
            </button>
            <button
              className={`${styles.button} ${styles.outlineButton}`}
              onClick={handleLearnMoreClick}
            >
              서비스 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <p className={styles.statsSubtitle}>TRUSTED BY 1000+ COMPANIES</p>
          <h2 className={styles.statsTitle}>혁신적인 화상미팅 솔루션을 경험하고 있습니다</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatStat(stats.users, 'users')}</div>
              <div className={styles.statLabel}>일일 사용자</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatStat(stats.stability, 'stability')}</div>
              <div className={styles.statLabel}>서비스 안정성</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatStat(stats.support, 'support')}</div>
              <div className={styles.statLabel}>기술지원</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatStat(stats.efficiency, 'efficiency')}</div>
              <div className={styles.statLabel}>업무 효율성 향상</div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.featuresTitle}>
            기업이 원하는 기능을 하나의 솔루션으로
          </h2>
          <p className={styles.featuresSubtitle}>
            AI 기반의 혁신적인 기능으로 기업의 업무 효율성을 극대화하세요
          </p>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles[feature.iconClass]}`}></div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 고객 후기 섹션 */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.testimonialsTitle}>고객들의 이야기</h2>
          <p className={styles.testimonialsSubtitle}>
            UniCon을 사용하는 기업들의 실제 경험담을 확인해보세요
          </p>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={styles.star}>★</span>
                  ))}
                </div>
                <p className={styles.testimonialText}>
                  "{testimonial.text}"
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorName}>{testimonial.author}</div>
                  <div className={styles.authorPosition}>{testimonial.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            지금 바로 UniCon을 경험해보세요
          </h2>
          <p className={styles.ctaDescription}>
            구독하여 UniCon의 모든 모듈 커스텀 기능을 제한 없이 사용해보세요
          </p>

          <form className={styles.ctaForm} onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="회사 이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              required
            />
            <button
              type="submit"
              className={styles.ctaButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '시작하기'}
            </button>
          </form>

          <p className={styles.ctaInfo}>
            신용카드가 필요하지 않습니다. 언제든지 취소 가능합니다.
          </p>
        </div>
      </section>

      {/* 회사 로고 섹션 */}
      <section className={styles.companySection}>
        <div className={styles.container}>
          <h2 className={styles.companyTitle}>
            500+ 기업이 UniCon을 신뢰하고 있습니다
          </h2>

          <div className={styles.logosContainer}>
            <div className={styles.logoItem}>
              <div className={styles.microsoftLogo}>Microsoft</div>
            </div>
            <div className={styles.logoItem}>
              <div className={styles.amazonLogo}>amazon</div>
            </div>
            <div className={styles.logoItem}>
              <div className={styles.netflixLogo}>NETFLIX</div>
            </div>
            <div className={styles.logoItem}>
              <div className={styles.samsungLogo}>SAMSUNG</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.brandSection}>
              <h2 className={styles.brandLogo}>UniCon</h2>
              <p className={styles.brandDescription}>
                스마트한 기업을 위한 최고의 화상미팅 솔루션
              </p>
            </div>

            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>제품</h3>
              <ul className={styles.footerLinks}>
                <li><a href="/features">기능 소개</a></li>
                <li><a href="/pricing">요금 안내</a></li>
                <li><a href="/security">보안</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>리소스</h3>
              <ul className={styles.footerLinks}>
                <li><a href="/cases">고객 사례</a></li>
                <li><a href="/blog">블로그</a></li>
                <li><a href="/help">도움말 센터</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>회사</h3>
              <ul className={styles.footerLinks}>
                <li><a href="/about">회사 소개</a></li>
                <li><a href="/careers">채용 정보</a></li>
                <li><a href="/contact">문의하기</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.copyright}>
              © 2025 UniCon. All rights reserved.
            </div>
            <div className={styles.footerBottomLinks}>
              <a href="/terms">이용약관</a>
              <a href="/privacy">개인정보처리방침</a>
              <a href="/cookies">쿠키 정책</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};