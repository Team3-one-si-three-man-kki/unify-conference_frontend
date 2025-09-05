import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Home, Building2, Package, Server, Users, Activity, TrendingUp, DollarSign, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const DashboardAnalytics = () => {
  const [data, setData] = useState({
    modules: [],
    tenants: [],
    serverStats: null
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data for demonstration
  const mockData = {
    modules: [
      { moduleId: '1', code: 'CHAT', name: '실시간 채팅', description: '실시간 채팅 모듈', price: '15000', icon: '💬', category: '커뮤니케이션' },
      { moduleId: '2', code: 'VIDEO', name: '화상회의', description: '화상회의 모듈', price: '150000', icon: '📹', category: '미디어' },
      { moduleId: '3', code: 'CANVAS', name: '화이트보드', description: '공유 화이트보드', price: '25000', icon: '🎨', category: '교육도구' },
      { moduleId: '4', code: 'QUIZ', name: '퀴즈 시스템', description: '실시간 퀴즈', price: '30000', icon: '❓', category: '교육도구' },
      { moduleId: '5', code: 'FACEAI', name: 'AI 얼굴인식', description: 'AI 얼굴인식 모듈', price: '200000', icon: '🤖', category: 'AI 도구' },
      { moduleId: '6', code: 'PARTICIPANTS', name: '참석자 관리', description: '참석자 관리 시스템', price: '0', icon: '👥', category: '관리도구' },
      { moduleId: '7', code: 'SCREEN', name: '화면 공유', description: '화면 공유 모듈', price: '35000', icon: '🖥️', category: '미디어' },
      { moduleId: '8', code: 'ATTENDANCE', name: '출석 체크', description: '자동 출석 체크', price: '0', icon: '✅', category: '관리도구' },
    ],
    tenants: [
      { tenantId: '1', name: '테크 컴퍼니', isActive: true, createdAt: '2024-01-15T09:00:00Z', user_count: 150, module_count: 8 },
      { tenantId: '2', name: '에듀 아카데미', isActive: true, createdAt: '2024-01-10T14:30:00Z', user_count: 320, module_count: 12 },
      { tenantId: '3', name: '미디어 솔루션', isActive: false, createdAt: '2024-01-08T11:15:00Z', user_count: 89, module_count: 6 },
      { tenantId: '4', name: '헬스케어 플랫폼', isActive: true, createdAt: '2024-01-05T16:45:00Z', user_count: 200, module_count: 10 },
      { tenantId: '5', name: '스마트 팩토리', isActive: true, createdAt: '2024-01-03T13:20:00Z', user_count: 75, module_count: 5 }
    ],
    serverStats: {
      summary: {
        totalConnectedPeers: 127,
        activeRoomCount: 23,
        uptime: 172800, // 48 hours
        memoryUsage: { rssPercentOfSystem: '12.5%' }
      },
      workers: [
        { pid: 1234, memoryUsage: { maxRssMb: 128 } },
        { pid: 5678, memoryUsage: { maxRssMb: 156 } },
        { pid: 9012, memoryUsage: { maxRssMb: 142 } }
      ]
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with staggered loading
      await new Promise(resolve => setTimeout(resolve, 800));
      setData(mockData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (!loading) {
        loadAllData();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [loading]);

  const stats = useMemo(() => {
    if (loading || !data.modules || !data.tenants) {
      return {
        totalModules: 0,
        activeTenants: 0,
        totalTenants: 0,
        connectedUsers: 0,
        activeSessions: 0,
        freeModules: 0,
        avgPrice: 0,
        serverStatus: '로딩중'
      };
    }

    const activeTenants = data.tenants.filter(t => t.isActive === true || t.isActive === '1' || t.isActive === 'Y').length;
    const freeModules = data.modules.filter(m => parseFloat(m.price || 0) === 0).length;
    const paidModules = data.modules.filter(m => parseFloat(m.price || 0) > 0);
    const totalRevenue = paidModules.reduce((sum, m) => sum + parseFloat(m.price || 0), 0);
    const avgPrice = paidModules.length > 0 ? totalRevenue / paidModules.length : 0;

    return {
      totalModules: data.modules.length,
      activeTenants: activeTenants,
      totalTenants: data.tenants.length,
      connectedUsers: data.serverStats?.summary?.totalConnectedPeers || 0,
      activeSessions: data.serverStats?.summary?.activeRoomCount || 0,
      freeModules: freeModules,
      avgPrice: Math.round(avgPrice),
      serverStatus: data.serverStats ? '정상' : '오류'
    };
  }, [data, loading]);

  const topPaidModules = useMemo(() => {
    if (!data.modules) return [];
    return [...data.modules]
      .filter(m => parseFloat(m.price || 0) > 0)
      .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
      .slice(0, 3);
  }, [data.modules]);

  const recentTenants = useMemo(() => {
    if (!data.tenants) return [];
    return [...data.tenants]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [data.tenants]);

  const refreshDashboard = () => {
    loadAllData();
  };

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
              실시간 시스템 현황
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </p>
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
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* Main Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
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
              </div>
            ))
          ) : (
            <>
              {/* Row 1 - Core Stats */}
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>총 모듈</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.totalModules}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#ddd6fe', borderRadius: '8px' }}>
                    <Package size={24} color="#7c3aed" />
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
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.activeTenants}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                    <Building2 size={24} color="#16a34a" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>현재 접속자</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.connectedUsers}</p>
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>활성 세션</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.activeSessions}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fed7aa', borderRadius: '8px' }}>
                    <Activity size={24} color="#ea580c" />
                  </div>
                </div>
              </div>

              {/* Row 2 - Additional Stats */}
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>총 테넌트</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.totalTenants}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                    <TrendingUp size={24} color="#0284c7" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>무료 모듈</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.freeModules}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                    <Zap size={24} color="#16a34a" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>평균 모듈 가격</p>
                    <p style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', margin: 0 }}>₩{stats.avgPrice.toLocaleString()}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fecaca', borderRadius: '8px' }}>
                    <DollarSign size={24} color="#dc2626" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>서버 상태</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {stats.serverStatus === '정상' ? (
                        <CheckCircle size={20} color="#16a34a" />
                      ) : (
                        <AlertTriangle size={20} color="#dc2626" />
                      )}
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: stats.serverStatus === '정상' ? '#16a34a' : '#dc2626'
                      }}>
                        {stats.serverStatus}
                      </span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: stats.serverStatus === '정상' ? '#dcfce7' : '#fecaca', 
                    borderRadius: '8px' 
                  }}>
                    <Server size={24} color={stats.serverStatus === '정상' ? '#16a34a' : '#dc2626'} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Top Paid Modules */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
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
              <DollarSign size={18} />
              고가 모듈 TOP 3
            </h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{
                    height: '70px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                ))}
              </div>
            ) : topPaidModules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topPaidModules.map((module, index) => (
                  <div key={module.moduleId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: ['#7c3aed', '#16a34a', '#ea580c'][index % 3],
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {module.name.charAt(0)}
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
                        color: '#64748b'
                      }}>
                        {module.description}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#059669',
                      textAlign: 'right'
                    }}>
                      ₩{parseInt(module.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px',
                padding: '40px 20px'
              }}>
                표시할 모듈이 없습니다.
              </div>
            )}
          </div>

          {/* Recent Tenant Activity */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
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
              <Clock size={18} />
              최근 테넌트 활동
            </h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} style={{
                    height: '60px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                ))}
              </div>
            ) : recentTenants.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentTenants.map((tenant) => (
                  <div key={tenant.tenantId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: tenant.isActive ? '#16a34a' : '#dc2626'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        {tenant.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        사용자 {tenant.user_count}명 • 모듈 {tenant.module_count}개
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: tenant.isActive ? '#16a34a' : '#dc2626',
                      padding: '4px 8px',
                      backgroundColor: tenant.isActive ? '#dcfce7' : '#fecaca',
                      borderRadius: '12px'
                    }}>
                      {tenant.isActive ? '활성' : '비활성'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px',
                padding: '40px 20px'
              }}>
                최근 활동이 없습니다.
              </div>
            )}
          </div>
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
  );
};

export default DashboardAnalytics;