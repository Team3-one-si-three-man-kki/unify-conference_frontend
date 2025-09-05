import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Home, Building2, Server, Activity, Cpu, HardDrive, Network, Users, Clock, Zap, Monitor, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

const ServerAnalyticsDashboard = () => {
  const [serverData, setServerData] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock server data
  const mockServerData = {
    summary: {
      activeRoomCount: 12,
      totalConnectedPeers: 48,
      uptime: 86400, // 24 hours in seconds
      memoryUsage: {
        rssPercentOfSystem: '8.37%',
        rssMB: 512,
        totalSystemMemoryMB: 6144
      },
      totalTransports: 24,
      totalProducers: 36,
      totalConsumers: 42
    },
    workers: [
      { pid: 1234, memoryUsage: { maxRssMb: 128 }, cpuTime: { user: 1200, system: 800 } },
      { pid: 5678, memoryUsage: { maxRssMb: 156 }, cpuTime: { user: 980, system: 650 } },
      { pid: 9012, memoryUsage: { maxRssMb: 142 }, cpuTime: { user: 1100, system: 720 } }
    ],
    rooms: [
      { id: '회의실-A', peersCount: 8 },
      { id: '수업-B', peersCount: 15 },
      { id: '세미나-C', peersCount: 12 },
      { id: '토론-D', peersCount: 6 },
      { id: '프레젠테이션-E', peersCount: 7 }
    ]
  };

  const mockTenants = [
    { tenantId: '1', name: '테크 컴퍼니', subDomain: 'tech', isActive: true, userCount: 150, moduleCount: 8, activeSessions: 5, connectedUsers: 23 },
    { tenantId: '2', name: '에듀 아카데미', subDomain: 'edu', isActive: true, userCount: 320, moduleCount: 12, activeSessions: 8, connectedUsers: 45 },
    { tenantId: '3', name: '미디어 솔루션', subDomain: 'media', isActive: false, userCount: 89, moduleCount: 6, activeSessions: 0, connectedUsers: 0 },
    { tenantId: '4', name: '헬스케어 플랫폼', subDomain: 'health', isActive: true, userCount: 200, moduleCount: 10, activeSessions: 3, connectedUsers: 18 }
  ];

  const loadServerData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setServerData(mockServerData);
      setTenants(mockTenants);
      setSelectedTenant(mockTenants[0]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('서버 데이터를 불러올 수 없습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServerData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        loadServerData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  const stats = useMemo(() => {
    if (!serverData) return null;

    const cpuUsage = serverData.workers.reduce((sum, w) => 
      sum + (w.cpuTime.user + w.cpuTime.system), 0) / 1000;
    
    const memoryUsage = parseFloat(serverData.summary.memoryUsage.rssPercentOfSystem?.replace('%', '') || '0');
    
    const networkUsage = Math.min(
      (serverData.summary.totalTransports * 2 + 
       serverData.summary.totalProducers * 5 + 
       serverData.summary.totalConsumers * 3), 100
    );

    return {
      activeSessions: serverData.summary.activeRoomCount,
      connectedUsers: serverData.summary.totalConnectedPeers,
      activeWorkers: serverData.workers.length,
      uptime: serverData.summary.uptime,
      cpuUsage: Math.min(Math.round(cpuUsage), 100),
      memoryUsage: Math.round(memoryUsage),
      networkUsage: Math.round(networkUsage),
      totalTransports: serverData.summary.totalTransports,
      totalProducers: serverData.summary.totalProducers,
      totalConsumers: serverData.summary.totalConsumers
    };
  }, [serverData]);

  const formatUptime = (seconds) => {
    if (!seconds) return '0초';
    if (seconds < 60) return `${Math.floor(seconds)}초`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  const getStatusColor = (isActive) => isActive ? '#34c759' : '#ff3b30';

  const refreshData = () => {
    loadServerData();
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
        padding: '0 24px 24px 24px'
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
              실시간 서버 현황
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
            onClick={refreshData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#3b82f6',
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

        {/* Server Status Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: serverData ? '#34c759' : '#ff3b30',
              animation: 'pulse 2s infinite'
            }}></div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Media Server 상태: {loading ? '확인 중...' : '정상 운영'}
            </h3>
          </div>
        </div>

        {/* Main Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
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
          ) : stats ? (
            <>
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
                  <div style={{ padding: '12px', backgroundColor: '#ddd6fe', borderRadius: '8px' }}>
                    <Activity size={24} color="#7c3aed" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>접속 사용자</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.connectedUsers}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                    <Users size={24} color="#16a34a" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>활성 Worker</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stats.activeWorkers}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fed7aa', borderRadius: '8px' }}>
                    <Zap size={24} color="#ea580c" />
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
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>서버 가동시간</p>
                    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{formatUptime(stats.uptime)}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                    <Clock size={24} color="#0284c7" />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Performance Metrics */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* System Performance */}
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
                <Settings size={18} />
                시스템 성능 지표
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>CPU 사용률</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{stats.cpuUsage}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats.cpuUsage}%`,
                    height: '100%',
                    backgroundColor: stats.cpuUsage > 80 ? '#ef4444' : stats.cpuUsage > 60 ? '#f59e0b' : '#10b981',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>메모리 사용률</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{stats.memoryUsage}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats.memoryUsage}%`,
                    height: '100%',
                    backgroundColor: stats.memoryUsage > 80 ? '#ef4444' : stats.memoryUsage > 60 ? '#f59e0b' : '#8b5cf6',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>네트워크 사용량</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{stats.networkUsage}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats.networkUsage}%`,
                    height: '100%',
                    backgroundColor: stats.networkUsage > 80 ? '#ef4444' : stats.networkUsage > 60 ? '#f59e0b' : '#06b6d4',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>

            {/* System Resources */}
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
                <Network size={18} />
                네트워크 리소스
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>총 Transport</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{stats.totalTransports}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>총 Producer</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{stats.totalProducers}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>총 Consumer</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{stats.totalConsumers}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Worker Processes and Live Sessions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Worker Processes */}
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
              <Cpu size={18} />
              Worker 프로세스
            </h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{
                    height: '60px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                ))}
              </div>
            ) : serverData?.workers ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {serverData.workers.map((worker, index) => (
                  <div key={worker.pid} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'white',
                      backgroundColor: '#6366f1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      W{index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '4px'
                      }}>
                        Worker #{index + 1}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        PID: {worker.pid} • 메모리: {worker.memoryUsage?.maxRssMb}MB
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#059669',
                      fontWeight: '600',
                      textAlign: 'right'
                    }}>
                      실행중
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Live Sessions */}
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
              <Monitor size={18} />
              라이브 세션
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
            ) : serverData?.rooms ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {serverData.rooms.map((room, index) => {
                  const getSessionIcon = (roomName) => {
                    if (roomName.includes('회의')) return '💼';
                    if (roomName.includes('수업')) return '📚';
                    if (roomName.includes('세미나')) return '🎯';
                    return '📹';
                  };

                  return (
                    <div key={room.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    >
                      <div style={{
                        fontSize: '20px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {getSessionIcon(room.id)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {room.id}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          활성 세션 • 품질: 우수
                        </div>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#059669',
                        textAlign: 'right'
                      }}>
                        {room.peersCount}명 참여중
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Tenant Management */}
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
            <Building2 size={18} />
            테넌트 현황 관리
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px'
          }}>
            {/* Tenant List */}
            <div>
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="테넌트 이름으로 검색..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  검색
                </button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} style={{
                      height: '80px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      animation: 'pulse 2s infinite'
                    }}></div>
                  ))}
                </div>
              ) : (
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {tenants.map((tenant, index) => (
                    <div 
                      key={tenant.tenantId}
                      onClick={() => setSelectedTenant(tenant)}
                      style={{
                        padding: '16px',
                        borderBottom: index < tenants.length - 1 ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedTenant?.tenantId === tenant.tenantId ? '#f0f9ff' : 'white',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTenant?.tenantId !== tenant.tenantId) {
                          e.target.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTenant?.tenantId !== tenant.tenantId) {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1e293b',
                              margin: 0
                            }}>
                              {tenant.name}
                            </h4>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(tenant.isActive)
                              }}></div>
                              <span style={{
                                fontSize: '12px',
                                color: getStatusColor(tenant.isActive),
                                fontWeight: '500'
                              }}>
                                {tenant.isActive ? '활성' : '비활성'}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            {tenant.subDomain}.example.com • 사용자 {tenant.userCount}명 • 모듈 {tenant.moduleCount}개
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '2px'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}>
                            {tenant.activeSessions}세션
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            {tenant.connectedUsers}명 접속
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Tenant Details */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#f8fafc'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 16px 0'
              }}>
                선택된 테넌트 상세정보
              </h4>

              {selectedTenant ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>테넌트 ID:</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                      {selectedTenant.tenantId}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>테넌트명:</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                      {selectedTenant.name}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>서브도메인:</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                      {selectedTenant.subDomain}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>활성상태:</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: getStatusColor(selectedTenant.isActive)
                    }}>
                      {selectedTenant.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#3b82f6',
                          marginBottom: '4px'
                        }}>
                          {selectedTenant.activeSessions}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#64748b'
                        }}>
                          활성 세션
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#059669',
                          marginBottom: '4px'
                        }}>
                          {selectedTenant.connectedUsers}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#64748b'
                        }}>
                          접속 사용자
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px',
                  padding: '40px 20px'
                }}>
                  테넌트를 선택하면 상세정보가 표시됩니다
                </div>
              )}
            </div>
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

export default ServerAnalyticsDashboard;