import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Building2, Package, Users, Activity, TrendingUp, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../../services/api/api';

/** ----------------------------------------------------------------
 * 테넌트 API 시퀀스 시도 (경로가 다를 수 있어 순차로 시도)
 * 응답 형태도 제각각이라 normalize로 통합
 * ---------------------------------------------------------------- */
const TENANT_ENDPOINTS = [
  // GET 페이징(권장)
  (p, s, q) => `/api/tenants?page=${p}&size=${s}${q ? `&keyword=${encodeURIComponent(q)}` : ''}`,
  // 대안 1 (관리자 prefix)
  (p, s, q) => `/api/admin/tenants?page=${p}&size=${s}${q ? `&keyword=${encodeURIComponent(q)}` : ''}`,
  // 대안 2 (단순 리스트)
  () => `/api/tenants`,
];

async function getTenants({ page = 1, size = 50, keyword = '' } = {}) {
  const errors = [];
  for (const makeUrl of TENANT_ENDPOINTS) {
    const url = makeUrl(page, size, keyword);
    try {
      const response = await apiClient.get(url);
      return normalizeTenants(response.data);
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error(`테넌트 API 호출 실패: ${errors.join(' -> ')}`);
}

function normalizeTenants(resp) {
  let list = [];
  // 배열 그대로
  if (Array.isArray(resp)) list = resp;
  // 자주 쓰는 키들
  else if (Array.isArray(resp.items)) list = resp.items;
  else if (Array.isArray(resp.content)) list = resp.content;
  else if (Array.isArray(resp.data)) list = resp.data;
  else if (Array.isArray(resp.list)) list = resp.list;
  else if (Array.isArray(resp.tenants)) list = resp.tenants;

  // 필드 매핑
  const mapped = list.map((t) => {
    const id =
      t.id ?? t.tenantId ?? t.tenant_id ?? t.code ?? t.key ?? String(Math.random()).slice(2);
    const name =
      t.name ?? t.tenantName ?? t.displayName ?? t.companyName ?? t.title ?? `Tenant-${id}`;
    const subDomain = t.subDomain ?? t.sub_domain ?? t.domain ?? t.subdomain ?? '-';
    const statusRaw = (t.status ?? t.enabled ?? t.active ?? t.isActive ?? '').toString().toLowerCase();
    const isActive = ['active', 'enabled', 'true', 'y', '1'].includes(statusRaw);
    const createdAt =
      t.createdAt ?? t.created_at ?? t.createTime ?? t.createdDate ?? t.created ?? t.regDate ?? '';

    return { id, name, subDomain, isActive, createdAt, raw: t };
  });

  // 생성일이 있으면 내림차순 정렬
  return mapped.sort((a, b) => {
    const A = Date.parse(a.createdAt) || 0;
    const B = Date.parse(b.createdAt) || 0;
    return B - A;
  });
}

/** ----------------------------------------------------------------
 * 서버상태(외부 엔드포인트) + 마켓 모듈 목록은 기존과 동일
 * 여기에 테넌트 로딩만 추가
 * ---------------------------------------------------------------- */
const DashboardAnalytics = () => {
  const [data, setData] = useState({
    modules: [],
    tenants: [],
    serverStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tenantError, setTenantError] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    setTenantsLoading(true);
    setTenantError('');
    try {
      // 1) 모듈 목록 불러오기
      const moduleResponse = await apiClient.get('/api/marketplace/modules', {
        params: { pageSize: 50, pageIndex: 1 },
      });
      const json = moduleResponse.data;

      // 2) 외부 서버 상태 불러오기 (인증 필요시 자동첨부)
      let serverStats = null;
      try {
        const serverStatsResponse = await apiClient.get('https://13.125.229.206:3000/api/admin/server-stats');
        serverStats = serverStatsResponse.data;
      } catch (err) {
        console.error('외부 서버 상태 불러오기 실패:', err);
      }

      // 3) 테넌트 목록 불러오기
      let tenants = [];
      try {
        tenants = await getTenants({ page: 1, size: 50 });
      } catch (e) {
        setTenantError(e.message || '테넌트 정보 로드 실패');
      } finally {
        setTenantsLoading(false);
      }

      // 4) 상태 업데이트
      setData({
        modules: Array.isArray(json.moduleVoList) ? json.moduleVoList : [],
        tenants,
        serverStats,
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      setData({ modules: [], tenants: [], serverStats: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const stats = useMemo(() => {
    const modules = data.modules ?? [];
    const prices = modules.map((m) => parseFloat(m.price ?? 0)).filter((n) => !isNaN(n));
    const paid = prices.filter((n) => n > 0);
    const avgPrice = paid.length ? Math.round(paid.reduce((a, b) => a + b, 0) / paid.length) : 0;

    const tenants = data.tenants ?? [];
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.isActive).length;

    // 서버 상태 간단 표시 (외부 API 모양 모름 -> 값 유무만으로)
    const serverStatus = data.serverStats ? '정상' : '준비안됨';

    return {
      totalModules: modules.length,
      activeTenants,
      totalTenants,
      connectedUsers: 0,
      activeSessions: 0,
      avgPrice,
      serverStatus,
    };
  }, [data]);

  const topPaidModules = useMemo(() => {
    if (!data.modules) return [];
    return [...data.modules]
      .filter((m) => parseFloat(m.price || 0) > 0)
      .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
      .slice(0, 3);
  }, [data.modules]);

  const refreshDashboard = () => {
    loadAllData();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0' }}>실시간 시스템 현황</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>마지막 업데이트: {lastUpdate.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={refreshDashboard}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <StatCard title="총 모듈" value={stats.totalModules} icon={<Package size={24} color="#7c3aed" />} bg="#ddd6fe" />
          <StatCard title="활성 테넌트" value={stats.activeTenants} icon={<Building2 size={24} color="#16a34a" />} bg="#dcfce7" />
          <StatCard title="현재 접속자" value={stats.connectedUsers} icon={<Users size={24} color="#d97706" />} bg="#fef3c7" />
          <StatCard title="활성 세션" value={stats.activeSessions} icon={<Activity size={24} color="#ea580c" />} bg="#fed7aa" />
          <StatCard title="총 테넌트" value={stats.totalTenants} icon={<TrendingUp size={24} color="#0284c7" />} bg="#e0f2fe" />
          <StatCard
            title="서버 상태"
            value={stats.serverStatus}
            icon={stats.serverStatus === '정상' ? <CheckCircle size={20} color="#16a34a" /> : <AlertTriangle size={20} color="#dc2626" />}
            bg={stats.serverStatus === '정상' ? '#dcfce7' : '#fecaca'}
          />
        </div>

        {/* Content Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Top Paid Modules */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <DollarSign size={18} /> 고가 모듈 TOP 3
            </h3>
            {loading ? (
              <SkeletonList count={3} height="70px" />
            ) : topPaidModules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topPaidModules.map((module, index) => (
                  <div
                    key={module.moduleId ?? module.id ?? index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '24px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: ['#7c3aed', '#16a34a', '#ea580c'][index % 3],
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      {module.name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{module.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{module.description}</div>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669', textAlign: 'right' }}>
                      ₩{parseInt(module.price || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMsg text="표시할 모듈이 없습니다." />
            )}
          </div>

          {/* Recent Tenants (연결됨) */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              minHeight: 280,
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={18} /> 최근 테넌트 활동
            </h3>

            {tenantsLoading ? (
              <SkeletonList count={5} height="48px" />
            ) : tenantError ? (
              <div style={{ color: '#dc2626', fontSize: 13, lineHeight: 1.6 }}>
                {tenantError}
                <br />
                <span style={{ color: '#64748b' }}>
                  경로가 다르면 <code>TENANT_ENDPOINTS</code> 배열을 API에 맞게 수정하세요.
                </span>
              </div>
            ) : data.tenants?.length ? (
              <TenantList tenants={data.tenants.slice(0, 8)} />
            ) : (
              <EmptyMsg text="표시할 테넌트가 없습니다." />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

/** 카드/공통 컴포넌트들 */
const StatCard = ({ title, value, icon, bg }) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>{title}</p>
        <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{value}</p>
      </div>
      <div style={{ padding: '12px', backgroundColor: bg, borderRadius: '8px' }}>{icon}</div>
    </div>
  </div>
);

const SkeletonList = ({ count, height }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} style={{ height, backgroundColor: '#f1f5f9', borderRadius: '8px', animation: 'pulse 2s infinite' }} />
      ))}
  </div>
);

const EmptyMsg = ({ text }) => (
  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '40px 20px' }}>{text}</div>
);

function Pill({ ok }) {
  const color = ok ? '#065f46' : '#991b1b';
  const bg = ok ? '#dcfce7' : '#fee2e2';
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color,
        background: bg,
        padding: '4px 8px',
        borderRadius: 999,
      }}
    >
      {ok ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

function TenantList({ tenants }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1fr 1.5fr',
          gap: 0,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 12px',
          fontSize: 13,
          color: '#475569',
          fontWeight: 600,
        }}
      >
        <div>이름</div>
        <div>서브도메인</div>
        <div>상태</div>
        <div>생성일</div>
      </div>
      <div style={{ maxHeight: 260, overflow: 'auto' }}>
        {tenants.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1.5fr',
              gap: 0,
              borderBottom: '1px solid #e2e8f0',
              padding: '10px 12px',
              fontSize: 14,
              alignItems: 'center',
              background: 'white',
            }}
          >
            <div style={{ color: '#0f172a', fontWeight: 600 }}>{t.name}</div>
            <div style={{ color: '#334155' }}>{t.subDomain}</div>
            <div>
              <Pill ok={t.isActive} />
            </div>
            <div style={{ color: '#475569' }}>{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardAnalytics;
