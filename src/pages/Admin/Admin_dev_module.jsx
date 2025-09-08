import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, Home, Building2, Package, Server, BarChart3, PieChart, TrendingUp, DollarSign, Activity, Award } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: Home, label: '대시보드' },
    { path: '/admin-tenant', icon: Building2, label: '테넌트' },
    { path: '/admin-module', icon: Package, label: '모듈' },
    { path: '/admin-server', icon: Server, label: '서버현황' }
  ];

  const getCurrentPath = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin-dashboard') {
      return '/admin';
    }
    return location.pathname;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Fixed Top Navigation */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              A
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              Admin Dashboard
            </h1>
          </div>
          
          <nav style={{
            display: 'flex',
            gap: '8px'
          }}>
            {navItems.map((item) => {
              const isActive = getCurrentPath() === item.path;
              const IconComponent = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#64748b'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <IconComponent size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content with top padding */}
      <div style={{
        paddingTop: '96px',   // 헤더 높이만큼 공간 확보
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
    </div>
  );
};

const EnhancedModuleAnalyticsDashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ API 호출
  const loadModuleData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/modules?pageSize=50&pageIndex=1&tenantId=default-tenant', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: sessionStorage.getItem('accessToken') || ''
        }
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      const list = data.moduleVoList || [];

      const normalized = list.map(item => ({
        moduleId: item.moduleId,
        code: item.code,
        name: item.name,
        description: item.description,
        price: item.price || 0,
        icon: item.icon || '📦',
        category: item.category || '미분류',
        status: item.status || 'active'
      }));

      setModules(normalized);
    } catch (error) {
      console.error('모듈 데이터를 불러올 수 없습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, []);

  // 📊 통계 계산
  const stats = useMemo(() => {
    const totalModules = modules.length;
    const activeModules = modules.filter(m => m.status === 'active').length;
    const freeModules = modules.filter(m => parseFloat(m.price) === 0).length;
    const paidModules = totalModules - freeModules;
    const totalRevenue = modules.reduce((sum, m) => sum + parseFloat(m.price), 0);
    const avgPrice = paidModules > 0 ? totalRevenue / paidModules : 0;

    const highPriceModules = modules.filter(m => parseFloat(m.price) > 50000).length;
    const betaModules = modules.filter(m => m.status === 'beta').length;

    return {
      totalModules,
      activeModules,
      freeModules,
      paidModules,
      avgPrice: Math.round(avgPrice),
      totalRevenue: Math.round(totalRevenue),
      highPriceModules,
      betaModules
    };
  }, [modules]);

  // 📊 카테고리 분포
  const categoryData = useMemo(() => {
    const categories = {};
    modules.forEach(module => {
      categories[module.category] = (categories[module.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [modules]);

  // 📊 상태 분포
  const statusData = useMemo(() => {
    const statuses = {};
    modules.forEach(module => {
      statuses[module.status] = (statuses[module.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ 
      name, 
      value,
      color: {
        active: '#16a34a',
        inactive: '#dc2626', 
        maintenance: '#f59e0b',
        beta: '#8b5cf6'
      }[name] || '#6b7280'
    }));
  }, [modules]);

  // 📊 가격대 분포
  const priceRangeData = useMemo(() => {
    const ranges = {
      '무료': 0,
      '1만원 미만': 0,
      '1-3만원': 0,
      '3-5만원': 0,
      '5만원 이상': 0
    };

    modules.forEach(module => {
      const price = parseFloat(module.price);
      if (price === 0) ranges['무료']++;
      else if (price < 10000) ranges['1만원 미만']++;
      else if (price < 30000) ranges['1-3만원']++;
      else if (price < 50000) ranges['3-5만원']++;
      else ranges['5만원 이상']++;
    });

    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [modules]);

  // 📊 TOP 5 고가 모듈
  const topModules = useMemo(() => {
    return [...modules]
      .filter(m => parseFloat(m.price || 0) > 0)
      .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
      .slice(0, 5);
  }, [modules]);

  // 상태 뱃지
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: '활성', bg: '#dcfce7', color: '#16a34a' },
      inactive: { text: '비활성', bg: '#fecaca', color: '#dc2626' },
      maintenance: { text: '점검중', bg: '#fef3c7', color: '#f59e0b' },
      beta: { text: '베타', bg: '#ddd6fe', color: '#8b5cf6' }
    };
    
    const config = statusConfig[status] || { text: status, bg: '#f1f5f9', color: '#64748b' };
    
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '500',
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: config.bg,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  const refreshData = () => {
    loadModuleData();
  };

  // 📈 DonutChart 컴포넌트 (목록형 + 스크롤)
  const DonutChart = ({ data, colors }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div style={{ textAlign: 'center', color: '#64748b' }}>데이터가 없습니다</div>;
    return (
      <div
        className="chart-scroll"
        style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}
      >
        {data.map((item, index) => (
          <div key={item.name} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '6px 10px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px', height: '12px',
                backgroundColor: colors[index % colors.length], 
                borderRadius: '50%'
              }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>{item.name}</span>
            </div>
            <span style={{ color: '#64748b', fontSize: '13px' }}>
              {((item.value / total) * 100).toFixed(1)}% ({item.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // 📊 통계 카드
  const StatCard = ({ title, value, icon: Icon, color, loading: cardLoading }) => (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  }}>
    {cardLoading ? (
      <>
        <div style={{
          height: '20px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          marginBottom: '12px',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          height: '32px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          animation: 'pulse 2s infinite'
        }} />
      </>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>{title}</p>
          <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>
            {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
          </p>
        </div>
        <div style={{
          padding: '12px',
          backgroundColor: color.bg,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color.icon} />
        </div>
      </div>
    )}
  </div>
);


  // 📊 차트 카드
  const ChartCard = ({ title, children, icon: Icon }) => (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Icon size={18} />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <AdminLayout>
      <div style={{
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh'
      }}>
        {/* Main Content */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '24px',
          paddingTop: '24px'
        }}>
          {/* Header Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 4px 0'
              }}>
                모듈 현황 및 분석
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>
                실시간 모듈 상태와 성능 지표를 확인하세요
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgb(59, 130, 246)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={16} style={{
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }} />
              새로고침
            </button>
          </div>

          {/* Stats Cards - 3열 고정 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <StatCard
              title="전체 모듈"
              value={stats.totalModules}
              icon={Package}
              color={{ bg: '#f3e8ff', icon: '#9333ea' }}
              loading={loading}
            />
            <StatCard
              title="활성 모듈"
              value={stats.activeModules}
              icon={Activity}
              color={{ bg: '#dcfce7', icon: '#16a34a' }}
              loading={loading}
            />
            <StatCard
              title="무료 모듈"
              value={stats.freeModules}
              icon={Award}
              color={{ bg: '#e0f2fe', icon: '#0284c7' }}
              loading={loading}
            />
            <StatCard
              title="유료 모듈"
              value={stats.paidModules}
              icon={TrendingUp}
              color={{ bg: '#fed7aa', icon: '#ea580c' }}
              loading={loading}
            />
            <StatCard
              title="평균 가격"
              value={`₩${stats.avgPrice.toLocaleString()}`}
              icon={BarChart3}
              color={{ bg: '#ddd6fe', icon: '#7c3aed' }}
              loading={loading}
            />
            <StatCard
              title="총 수익"
              value={`₩${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color={{ bg: '#fecaca', icon: '#dc2626' }}
              loading={loading}
            />
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Category Donut Chart */}
            <ChartCard title="카테고리별 모듈 현황" icon={PieChart}>
              {loading ? (
                <div style={{
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid #9333ea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : (
                <DonutChart 
                  data={categoryData} 
                  title="카테고리별 분포"
                  colors={['#a5b4fc', '#f9a8d4', '#fde68a', '#6ee7b7', '#fca5a5', '#c4b5fd']}
                />
              )}
            </ChartCard>

            {/* Status Chart */}
            <ChartCard title="모듈 상태 분포" icon={Activity}>
              {loading ? (
                <div style={{
                  height: '250px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid #9333ea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : (
                <div className="chart-scroll" style={{ padding: '10px 0' }}>
                  {statusData.map((item, index) => (
                    <div key={item.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: index < statusData.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: item.color,
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                          {item.name === 'active' ? '활성' : 
                           item.name === 'inactive' ? '비활성' :
                           item.name === 'maintenance' ? '점검중' :
                           item.name === 'beta' ? '베타' : item.name}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {((item.value / modules.length) * 100).toFixed(1)}%
                        </span>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1e293b',
                          minWidth: '24px',
                          textAlign: 'right'
                        }}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            {/* Price Range Chart */}
            <ChartCard title="가격대별 모듈 분포" icon={BarChart3}>
              {loading ? (
                <div style={{
                  height: '250px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid #9333ea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : (
                <div className="chart-scroll" style={{ padding: '10px 0' }}>
                  {priceRangeData.map((item, index) => (
                    <div key={item.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: index < priceRangeData.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: ['#16a34a', '#fbbf24', '#f97316', '#ef4444', '#8b5cf6'][index],
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                          {item.name}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {((item.value / modules.length) * 100).toFixed(1)}%
                        </span>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1e293b',
                          minWidth: '24px',
                          textAlign: 'right'
                        }}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          {/* Top Modules Table (스크롤) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px'
          }}>
            <ChartCard title="고가 모듈 TOP 5" icon={Award}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} style={{
                      height: '70px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      animation: 'pulse 2s infinite'
                    }}></div>
                  ))}
                </div>
              ) : (
                <div style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '8px',
                  scrollbarWidth: 'thin'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {topModules.map((module, index) => (
                      <div key={module.moduleId} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#f59e0b',
                          backgroundColor: '#fef3c7',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          minWidth: '40px',
                          textAlign: 'center'
                        }}>
                          #{index + 1}
                        </div>
                        <div style={{
                          fontSize: '24px',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {module.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '4px'
                          }}>
                            {module.name}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{module.category}</span>
                            <span>•</span>
                            <span>{module.description}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getStatusBadge(module.status)}
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: parseFloat(module.price) === 0 ? '#16a34a' : '#1e40af',
                            textAlign: 'right'
                          }}>
                            {parseFloat(module.price) === 0 ? '무료' : `₩${parseInt(module.price).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

        </main>

        {/* ✅ style jsx -> style 교체 + 스크롤 공통 클래스 정의 */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .chart-scroll {
            max-height: 260px;
            overflow-y: auto;
            padding-right: 8px;
            scrollbar-width: thin;
          }
          .chart-scroll::-webkit-scrollbar { width: 8px; }
          .chart-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 8px; }
          .chart-scroll::-webkit-scrollbar-track { background: transparent; }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default EnhancedModuleAnalyticsDashboard;
