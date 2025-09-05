import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Home, Building2, Package, Server, Users, Calendar, Eye, Settings, BarChart3, Filter } from 'lucide-react';

const TenantManagementSystem = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for demonstration
  const mockTenants = [
    {
      tenantId: 'TNT001',
      name: 'ABC 컴퍼니',
      subDomain: 'abc-company',
      isActive: '1',
      userCount: 25,
      moduleCount: 8,
      createdAt: '2024-01-15 09:30:00'
    },
    {
      tenantId: 'TNT002',
      name: '테크솔루션',
      subDomain: 'tech-solution',
      isActive: '1',
      userCount: 42,
      moduleCount: 12,
      createdAt: '2024-02-20 14:15:00'
    },
    {
      tenantId: 'TNT003',
      name: '글로벌 인더스트리',
      subDomain: 'global-industry',
      isActive: '0',
      userCount: 18,
      moduleCount: 5,
      createdAt: '2024-01-08 11:45:00'
    },
    {
      tenantId: 'TNT004',
      name: '스마트 시스템즈',
      subDomain: 'smart-systems',
      isActive: '1',
      userCount: 67,
      moduleCount: 15,
      createdAt: '2024-03-05 16:20:00'
    },
    {
      tenantId: 'TNT005',
      name: '디지털 이노베이션',
      subDomain: 'digital-innovation',
      isActive: '0',
      userCount: 12,
      moduleCount: 3,
      createdAt: '2024-01-30 13:10:00'
    }
  ];

  const loadTenantData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTenants(mockTenants);
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
    return tenants.filter(tenant => {
      const matchesSearch = !searchTerm || 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.tenantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.subDomain.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && (tenant.isActive === '1' || tenant.isActive === 'Y')) ||
        (statusFilter === 'inactive' && (tenant.isActive === '0' || tenant.isActive === 'N'));

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
    const active = String(isActive).trim();
    if (active === '1' || active === 'Y' || active === 'true') {
      return { text: '활성', className: 'status-active' };
    }
    return { text: '비활성', className: 'status-inactive' };
  };

  const formatDate = (dateString) => {
    return dateString ? dateString.split(' ')[0] : '';
  };

  // Statistics
  const activeCount = tenants.filter(t => t.isActive === '1').length;
  const inactiveCount = tenants.length - activeCount;
  const totalUsers = tenants.reduce((sum, t) => sum + t.userCount, 0);
  const totalModules = tenants.reduce((sum, t) => sum + t.moduleCount, 0);

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
    

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>전체 테넌트</p>
                <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{tenants.length}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <Building2 size={24} color="#1e40af" />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>활성 테넌트</p>
                <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{activeCount}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <BarChart3 size={24} color="#16a34a" />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>전체 사용자</p>
                <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{totalUsers.toLocaleString()}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <Users size={24} color="#d97706" />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>전체 모듈</p>
                <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{totalModules}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
                <Package size={24} color="#9333ea" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              테넌트 목록
            </h2>
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
                opacity: loading ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              새로고침
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search */}
            <div style={{
              position: 'relative',
              flex: '1',
              minWidth: '300px',
              maxWidth: '400px'
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
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
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1e40af'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <Filter size={16} color="#64748b" />
              <button
                onClick={() => handleFilterChange('all')}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: statusFilter === 'all' ? '#1e40af' : 'white',
                  color: statusFilter === 'all' ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                전체
              </button>
              <button
                onClick={() => handleFilterChange('active')}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: statusFilter === 'active' ? '#16a34a' : 'white',
                  color: statusFilter === 'active' ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                활성
              </button>
              <button
                onClick={() => handleFilterChange('inactive')}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: statusFilter === 'inactive' ? '#dc2626' : 'white',
                  color: statusFilter === 'inactive' ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                비활성
              </button>
            </div>
          </div>
        </div>

        {/* Tenant Table */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#64748b'
            }}>
              <div style={{
                display: 'inline-block',
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #1e40af',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <p style={{ margin: 0, fontSize: '14px' }}>테넌트 데이터를 불러오는 중...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#64748b'
            }}>
              <Building2 size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>조회된 테넌트가 없습니다</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>다른 검색 조건을 시도해보세요</p>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      테넌트 정보
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      도메인
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      사용현황
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      생성일
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      상태
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant, index) => {
                    const statusInfo = getStatusInfo(tenant.isActive);
                    return (
                      <tr key={tenant.tenantId} style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1e293b',
                              marginBottom: '4px'
                            }}>
                              {tenant.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              ID: {tenant.tenantId}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            fontSize: '13px',
                            color: '#475569',
                            fontFamily: 'monospace',
                            backgroundColor: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {tenant.subDomain}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                              color: '#475569'
                            }}>
                              <Users size={14} />
                              {tenant.userCount}명
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                              color: '#475569'
                            }}>
                              <Package size={14} />
                              {tenant.moduleCount}개
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            <Calendar size={14} />
                            {formatDate(tenant.createdAt)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: statusInfo.className === 'status-active' ? '#dcfce7' : '#fecaca',
                            color: statusInfo.className === 'status-active' ? '#166534' : '#991b1b'
                          }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: statusInfo.className === 'status-active' ? '#16a34a' : '#dc2626',
                              marginRight: '6px'
                            }}></div>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button style={{
                              padding: '6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Eye size={14} color="#64748b" />
                            </button>
                            <button style={{
                              padding: '6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Settings size={14} color="#64748b" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TenantManagementSystem;