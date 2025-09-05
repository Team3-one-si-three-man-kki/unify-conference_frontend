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
        paddingTop: '80px' // Fixed header height + margin
      }}>
        {children}
      </div>
    </div>
  );
};

const EnhancedModuleAnalyticsDashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data with proper Korean text
  const mockModules = [
    { moduleId: '1', code: 'CHAT', name: '실시간 채팅', description: '실시간 채팅 모듈', price: '15000', icon: '💬', category: '커뮤니케이션', status: 'active' },
    { moduleId: '2', code: 'VIDEO', name: '화상회의', description: '화상회의 모듈', price: '50000', icon: '📹', category: '미디어', status: 'active' },
    { moduleId: '3', code: 'CANVAS', name: '화이트보드', description: '공유 화이트보드', price: '25000', icon: '🎨', category: '교육도구', status: 'active' },
    { moduleId: '4', code: 'QUIZ', name: '퀴즈 시스템', description: '실시간 퀴즈', price: '30000', icon: '❓', category: '교육도구', status: 'inactive' },
    { moduleId: '5', code: 'FACEAI', name: 'AI 얼굴인식', description: 'AI 얼굴인식 모듈', price: '80000', icon: '🤖', category: 'AI 도구', status: 'active' },
    { moduleId: '6', code: 'PARTICIPANTS', name: '참석자 관리', description: '참석자 관리 시스템', price: '20000', icon: '👥', category: '관리도구', status: 'active' },
    { moduleId: '7', code: 'SCREEN', name: '화면 공유', description: '화면 공유 모듈', price: '35000', icon: '🖥️', category: '미디어', status: 'active' },
    { moduleId: '8', code: 'ATTENDANCE', name: '출석 체크', description: '자동 출석 체크', price: '0', icon: '✅', category: '관리도구', status: 'active' },
    { moduleId: '9', code: 'CAMERA', name: '카메라 제어', description: '카메라 제어 모듈', price: '40000', icon: '📷', category: '미디어', status: 'maintenance' },
    { moduleId: '10', code: 'MIC', name: '마이크 관리', description: '마이크 관리 시스템', price: '0', icon: '🎤', category: '미디어', status: 'active' },
    { moduleId: '11', code: 'ANALYTICS', name: '데이터 분석', description: '실시간 데이터 분석', price: '60000', icon: '📊', category: 'AI 도구', status: 'beta' },
    { moduleId: '12', code: 'SECURITY', name: '보안 모듈', description: '고급 보안 기능', price: '45000', icon: '🛡️', category: '보안', status: 'active' }
  ];

  const loadModuleData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setModules(mockModules);
    } catch (error) {
      console.error('모듈 데이터를 불러올 수 없습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, []);

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

  const categoryData = useMemo(() => {
    const categories = {};
    modules.forEach(module => {
      categories[module.category] = (categories[module.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [modules]);

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

  const topModules = useMemo(() => {
    return [...modules]
      .filter(m => parseFloat(m.price || 0) > 0)
      .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
      .slice(0, 5);
  }, [modules]);

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

  // DonutChart Component
  const DonutChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: '#64748b' }}>데이터가 없습니다</div>;
  let cumulativePercentage = 0;
  const radius = 80;
  const strokeWidth = 20;
  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '300px' }}>
  <div style={{ position: 'relative', marginBottom: '20px' }}>
  <svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
  {data.map((item, index) => {
  const percentage = (item.value / total) * 100;
  const strokeDasharray = `${(percentage / 100) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`;
  const strokeDashoffset = -((cumulativePercentage / 100) * 2 * Math.PI * radius);
  const color = colors[index % colors.length];
  cumulativePercentage += percentage;
  return (
  <circle
  key={item.name}
  cx="100"
  cy="100"
  r={radius}
  fill="none"
  stroke={color}
  strokeWidth={strokeWidth}
  strokeDasharray={strokeDasharray}
  strokeDashoffset={strokeDashoffset}
  style={{ transition: 'all 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
  />
  );
  })}
  </svg>
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{total}</div>
  <div style={{ fontSize: '12px', color: '#64748b' }}>총 모듈</div>
  </div>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxHeight: '150px', overflowY: 'auto' }}>
  {data.map((item, index) => (
  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <div style={{ width: '12px', height: '12px', backgroundColor: colors[index % colors.length], borderRadius: '50%' }}></div>
  <span style={{ color: '#374151', fontWeight: '500' }}>{item.name}</span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ color: '#64748b', fontSize: '12px' }}>{((item.value / total) * 100).toFixed(1)}%</span>
  <span style={{ color: '#1e293b', fontWeight: '600' }}>{item.value}</span>
  </div>
  </div>
  ))}
  </div>
  </div>
  );
  };

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
          }}></div>
          <div style={{ 
            height: '32px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }}></div>
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
                backgroundColor: '#9333ea',
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

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                <div style={{ height: '250px', padding: '10px 0' }}>
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
                <div style={{ height: '250px', padding: '10px 0' }}>
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

          {/* Top Modules Table */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px'
          }}>
            <ChartCard title="고가 모듈 TOP 5" icon={Award}>
              {loading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
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
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
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
              )}
            </ChartCard>
          </div>
        </main>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default EnhancedModuleAnalyticsDashboard;