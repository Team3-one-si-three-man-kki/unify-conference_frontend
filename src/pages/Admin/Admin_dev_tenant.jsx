import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Building2, Package, Users, Calendar, Eye, Settings, BarChart3, Filter } from 'lucide-react';

/** ----------------------------------------------------------------
 * 공통 fetch 유틸 (대시보드와 동일)
 * ---------------------------------------------------------------- */
async function fetchJSON(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    let raw = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || '';
    try {
      const j = JSON.parse(raw);
      if (j?.accessToken) raw = j.accessToken;
    } catch (_) {}

    const clean = String(raw).replace(/^Bearer\s+/i, '').replace(/[^\x20-\x7E]/g, '').trim();
    const token = clean ? `Bearer ${clean}` : null;

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: token } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

const TENANT_ENDPOINTS = [
  (p, s, q) => `/api/tenants?page=${p}&size=${s}${q ? `&keyword=${encodeURIComponent(q)}` : ''}`,
  (p, s, q) => `/api/admin/tenants?page=${p}&size=${s}${q ? `&keyword=${encodeURIComponent(q)}` : ''}`,
  () => `/api/tenants`,
];

async function getTenants({ page = 1, size = 50, keyword = '' } = {}) {
  const errors = [];
  for (const makeUrl of TENANT_ENDPOINTS) {
    const url = makeUrl(page, size, keyword);
    try {
      const json = await fetchJSON(url);
      return normalizeTenants(json);
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error(`테넌트 API 호출 실패: ${errors.join(' -> ')}`);
}

function normalizeTenants(resp) {
  let list = [];
  if (Array.isArray(resp)) list = resp;
  else if (Array.isArray(resp.items)) list = resp.items;
  else if (Array.isArray(resp.content)) list = resp.content;
  else if (Array.isArray(resp.data)) list = resp.data;
  else if (Array.isArray(resp.list)) list = resp.list;
  else if (Array.isArray(resp.tenants)) list = resp.tenants;

  return list.map((t) => {
    const id = t.id ?? t.tenantId ?? t.tenant_id ?? String(Math.random()).slice(2);
    const name = t.name ?? t.tenantName ?? t.displayName ?? t.companyName ?? `Tenant-${id}`;
    const subDomain = t.subDomain ?? t.sub_domain ?? t.domain ?? t.subdomain ?? '-';
    const statusRaw = (t.status ?? t.enabled ?? t.active ?? t.isActive ?? '').toString().toLowerCase();
    const isActive = ['active', 'enabled', 'true', 'y', '1'].includes(statusRaw);
    const createdAt = t.createdAt ?? t.created_at ?? t.createTime ?? t.regDate ?? '';

    return {
      tenantId: String(id),   // 문자열 강제 변환 ✅
      name,
      subDomain,
      isActive: isActive ? '1' : '0',
      userCount: t.userCount ?? 0,
      moduleCount: t.moduleCount ?? 0,
      createdAt,
    };
  });
}

const TenantManagementSystem = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadTenantData = async () => {
    setLoading(true);
    try {
      const list = await getTenants({ page: 1, size: 50 });
      setTenants(list);
    } catch (error) {
      console.error('테넌트 데이터를 불러올 수 없습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch =
        !searchTerm ||
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tenant.tenantId).toLowerCase().includes(searchTerm.toLowerCase()) ||  // 안전하게 변환 ✅
        tenant.subDomain.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && tenant.isActive === '1') ||
        (statusFilter === 'inactive' && tenant.isActive === '0');

      return matchesSearch && matchesStatus;
    });
  }, [tenants, searchTerm, statusFilter]);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
  };

  const refreshData = () => {
    loadTenantData();
  };

  const getStatusInfo = (isActive) => {
    if (isActive === '1' || isActive === true) {
      return { text: '활성', className: 'status-active' };
    }
    return { text: '비활성', className: 'status-inactive' };
  };

  const formatDate = (dateString) => {
    return dateString ? dateString.split(' ')[0] : '';
  };

  // 통계
  const activeCount = tenants.filter((t) => t.isActive === '1').length;
  const totalUsers = tenants.reduce((sum, t) => sum + (t.userCount || 0), 0);
  const totalModules = tenants.reduce((sum, t) => sum + (t.moduleCount || 0), 0);

 return (
  <div
    style={{
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
    }}
  >
    {/* 헤더 높이만큼 marginTop 추가 (AdminLayout 고정 헤더와 겹치지 않도록) */}
    <main
      style={{
        maxWidth: '1400px',
        margin: '96px auto 0 auto', // 헤더 높이 보정 (약 80px + 여유)
        padding: '0 24px 24px 24px',
      }}
    >
      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <StatCard title="전체 테넌트" value={tenants.length} icon={<Building2 size={24} color="#1e40af" />} bg="#dbeafe" />
        <StatCard title="활성 테넌트" value={activeCount} icon={<BarChart3 size={24} color="#16a34a" />} bg="#dcfce7" />
        <StatCard title="전체 사용자" value={totalUsers} icon={<Users size={24} color="#d97706" />} bg="#fef3c7" />
        <StatCard title="전체 모듈" value={totalModules} icon={<Package size={24} color="#9333ea" />} bg="#f3e8ff" />
      </div>

      {/* 검색 & 필터 UI */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>테넌트 목록</h2>
          <button
            onClick={refreshData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
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

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '300px', maxWidth: '400px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
            <input
              type="text"
              placeholder="테넌트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '12px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={16} color="#64748b" />
            <FilterButton label="전체" active={statusFilter === 'all'} onClick={() => handleFilterChange('all')} />
            <FilterButton label="활성" active={statusFilter === 'active'} onClick={() => handleFilterChange('active')} />
            <FilterButton label="비활성" active={statusFilter === 'inactive'} onClick={() => handleFilterChange('inactive')} />
          </div>
        </div>
      </div>

      {/* 테이블을 스크롤 가능하게 */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          maxHeight: '500px', // 테이블 최대 높이 제한
          overflowY: 'auto', // 세로 스크롤
        }}
      >
        <TenantTable tenants={filteredTenants} loading={loading} getStatusInfo={getStatusInfo} formatDate={formatDate} />
      </div>
    </main>
  </div>
);

};

/** 재사용 컴포넌트 */
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

const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: active ? (label === '활성' ? '#16a34a' : label === '비활성' ? '#dc2626' : '#1e40af') : 'white',
      color: active ? 'white' : '#374151',
      cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

const TenantTable = ({ tenants, loading, getStatusInfo, formatDate }) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
    {loading ? (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>로딩 중...</div>
    ) : tenants.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>조회된 테넌트가 없습니다</div>
    ) : (
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <Th>테넌트 정보</Th>
              <Th>도메인</Th>
              <Th>사용현황</Th>
              <Th>생성일</Th>
              <Th>상태</Th>
              <Th style={{ textAlign: 'center' }}>작업</Th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const statusInfo = getStatusInfo(tenant.isActive);
              return (
                <tr key={tenant.tenantId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <Td>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{tenant.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {tenant.tenantId}</div>
                    </div>
                  </Td>
                  <Td>
                    <span style={{ fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>{tenant.subDomain}</span>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569' }}>
                        <Users size={14} />
                        {tenant.userCount}명
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569' }}>
                        <Package size={14} />
                        {tenant.moduleCount}개
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      <Calendar size={14} /> {formatDate(tenant.createdAt)}
                    </div>
                  </Td>
                  <Td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: statusInfo.className === 'status-active' ? '#dcfce7' : '#fecaca',
                        color: statusInfo.className === 'status-active' ? '#166534' : '#991b1b',
                      }}
                    >
                      {statusInfo.text}
                    </span>
                  </Td>
                  <Td style={{ textAlign: 'center' }}>
                    <button style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }}>
                      <Eye size={14} color="#64748b" />
                    </button>
                    <button style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', marginLeft: '4px' }}>
                      <Settings size={14} color="#64748b" />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const Th = ({ children, ...props }) => (
  <th {...props} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
    {children}
  </th>
);

const Td = ({ children, ...props }) => <td {...props} style={{ padding: '16px' }}>{children}</td>;

export default TenantManagementSystem;
