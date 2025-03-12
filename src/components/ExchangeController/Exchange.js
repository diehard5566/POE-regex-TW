import React, { useState, useEffect } from 'react';
import './Exchange.css';

function Exchange() {
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [officialLink, setOfficialLink] = useState('');
    const [exchangeRates, setExchangeRates] = useState([]);
    const [mainRate, setMainRate] = useState(null);

    useEffect(() => {
        fetchData();
        
        // 設定每5分鐘重新獲取資料
        const intervalId = setInterval(fetchData, 5 * 60 * 1000);
        
        // 清理函數
        return () => clearInterval(intervalId);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';

            console.log('使用的 API URL:', apiUrl);
            
            const response = await fetch(`${apiUrl}/exchange`);
            
            if (!response.ok) {
                throw new Error(`API 回應錯誤: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            console.log('API 回應數據:', data);
            
            if (!data || !data.url) {
                throw new Error('API 回應格式不正確');
            }
            
            setApiResponse(data);
            setOfficialLink(data.url);
            
            // 設定匯率數據
            if (data.exchangeRates && Array.isArray(data.exchangeRates)) {
                setExchangeRates(data.exchangeRates);
            }
            
            // 設定主要匯率
            if (data.rates && data.rates.divine) {
                setMainRate(data.rates.divine);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('獲取匯率資料時出錯:', err);
            setError(err.message || '獲取資料時發生錯誤');
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchData();
    };

    // 渲染匯率列表
    const renderExchangeRates = () => {
        if (!exchangeRates || exchangeRates.length === 0) {
            return <p>無可用匯率數據</p>;
        }
        
        return (
            <div className="exchange-rates-row">
                {exchangeRates.map((rate, index) => (
                    <span key={index}>{rate}c</span>
                ))}
            </div>
        );
    };

    // 計算分數匯率
    const calculateDRates = () => {
        if (!mainRate) {
            return [];
        }
        
        try {
            return Array.from({ length: 9 }, (_, i) => {
                const dValue = (i + 1) / 10;
                const cValue = Math.round(mainRate * dValue);

                return `${dValue.toFixed(1)}D = ${cValue}c`;
            });
        } catch (error) {
            console.error('計算匯率時出錯:', error);
            return [];
        }
    };

    if (loading) {
        return (
            <div className="exchange-container">
                <h2 className="exchange-title">流亡黯道 - 物品匯率</h2>
                <div className="loading-message">載入中，請稍候...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exchange-container">
                <h2 className="exchange-title">流亡黯道 - 物品匯率</h2>
                <div className="error-container">
                    <div className="error-message">
                        {error}
                    </div>
                    <button className="retry-button" onClick={handleRetry}>
                        重試
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="exchange-container">
            <h2 className="exchange-title">神聖混沌即時比值</h2>
            <h3 className="exchange-subtitle">當前聯盟: {apiResponse?.league || '未知'}</h3>
            <a
                href={officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="exchange-official-link"
            >
                官方交易網站
            </a>
            
            <div className="exchange-rates">
                <h3 className="exchange-subtitle">目前1D換C的價格，取官網前10筆</h3>
                <h4 className="exchange-subtitle">第 1 ~ 10 筆：</h4>
                {renderExchangeRates()}
            </div>
            
            {mainRate && (
                <div className="exchange-main-rate">
                    <h3 className="exchange-subtitle">換算成c：</h3>
                    <p className="exchange-note">取第二筆為基準作換算，小數點無條件捨去</p>
                    <div className="exchange-rate-wrapper">
                        <ul className="exchange-rate-list">
                            {calculateDRates().map((rate, index) => (
                                <li key={index}>{rate}</li>
                            ))}
                        </ul>
                        <div className="exchange-main-rate-display">
                            <div className="exchange-main-rate-value">
                                1D = {mainRate}c
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="exchange-update-info">
                最後更新時間: {new Date(apiResponse?.lastUpdated).toLocaleString()}
            </div>
        </div>
    );
}

export default Exchange;