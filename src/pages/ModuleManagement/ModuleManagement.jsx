import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api/api'; // API 클라이언트 import
import './ModuleManagement.css'; // CSS 파일 import

// 모듈 카드 UI를 담당하는 별도의 컴포넌트
const ModuleCard = ({ module, onShowDetails }) => (
    <div className="module-card">
        <span className="module-icon">{module.icon || '📦'}</span>
        <div className="module-name">{module.name}</div>
        <div className="module-code">({module.code})</div>
        <p className="module-desc">{module.description}</p>
        <div className="module-info">
            구매일: {module.purchasedAt}
        </div>
        <button className="details-button" onClick={() => onShowDetails(module)}>
            상세보기
        </button>
    </div>
);

// 모듈 상세 정보 UI를 담당하는 별도의 컴포넌트
const ModuleDetailsPanel = ({ module, usageData, isLoading }) => (
    <div className="details-panel">
        <div className="details-header">
            <h3>{module.name} 사용 내역</h3>
            <p>총 사용 횟수: {isLoading ? '조회 중...' : `${usageData.length}회`}</p>
        </div>
        <div className="details-body">
            <table>
                <thead>
                    <tr>
                        <th>사용한 미팅룸</th>
                        <th>마지막 사용일</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr><td colSpan="2">로딩 중...</td></tr>
                    ) : usageData.length === 0 ? (
                        <tr><td colSpan="2">사용 내역이 없습니다.</td></tr>
                    ) : (
                        usageData.map((usage, index) => (
                            <tr key={index}>
                                <td>{usage.roomName}</td>
                                <td>{usage.lastUsed}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// '모듈 관리' 페이지 메인 컴포넌트
const ModuleManagement = () => {
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [usageData, setUsageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태 true
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // 보유 모듈 목록을 조회하는 함수
    const fetchModules = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/manager/modules');
            setModules(response.data);
        } catch (error) {
            console.error("모듈 목록 조회 실패:", error);
            alert('모듈 목록을 불러오는 데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 컴포넌트가 처음 렌더링될 때 모듈 목록을 불러옵니다.
    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    // '상세보기' 버튼 클릭 시 실행될 함수
    const handleShowDetails = useCallback(async (module) => {
        // 이미 선택된 모듈을 다시 클릭하면 상세 패널을 닫습니다.
        if (selectedModule && selectedModule.moduleId === module.moduleId) {
            setSelectedModule(null);
            setUsageData([]);
            return;
        }

        setSelectedModule(module);
        setIsDetailsLoading(true);
        setUsageData([]); // 이전 데이터 초기화

        try {
            const response = await apiClient.get(`/api/manager/modules/${module.moduleId}/usage`);
            setUsageData(response.data);
        } catch (error) {
            console.error(`${module.name} 사용 내역 조회 실패:`, error);
            alert(`${module.name}의 사용 내역을 불러오는 데 실패했습니다.`);
        } finally {
            setIsDetailsLoading(false);
        }
    }, [selectedModule]); // selectedModule이 바뀔 때마다 함수를 새로 정의

    return (
        <div className="module-management-page">
            <div className="page-title-box">
                <h2>모듈 관리</h2>
                <div className="breadcrumb">Home &gt; 모듈 &gt; 모듈 관리</div>
            </div>

            <div className="main-container">
                {/* 왼쪽: 모듈 목록 패널 */}
                <div className="module-list-panel">
                    <h3>보유 모듈 목록</h3>
                    <div className="card-container">
                        {isLoading ? (
                            <p>모듈 목록을 불러오는 중...</p>
                        ) : modules.length === 0 ? (
                            <p>보유한 모듈이 없습니다.</p>
                        ) : (
                            modules.map(module => (
                                <ModuleCard key={module.moduleId} module={module} onShowDetails={handleShowDetails} />
                            ))
                        )}
                    </div>
                </div>

                {/* 오른쪽: 상세 정보 패널 (선택된 모듈이 있을 때만 보임) */}
                {selectedModule && (
                    <ModuleDetailsPanel 
                        module={selectedModule} 
                        usageData={usageData} 
                        isLoading={isDetailsLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default ModuleManagement;