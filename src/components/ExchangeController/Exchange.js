import React, { useState, useEffect } from 'react';
import './Exchange.css';

const Exchange = () => {
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);
    const [officialLink, setOfficialLink] = useState('');
    const [exchangeRates, setExchangeRates] = useState([]);
    const [mainRate, setMainRate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/exchange`);
                const data = await response.json();
                
                setApiResponse(data);
                setOfficialLink(data.officialLink);
                setExchangeRates(data.exchangeRates);
                setMainRate(data.mainRate);
            } catch (error) {
                setError('無法加載數據。');
            }
        };

        fetchData();
    }, []);

    const renderExchangeRates = () => {
        return (
            <div className="exchange-rates-row">
                {exchangeRates.map((rate, index) => (
                    <span key={index}>{rate}c </span>
                ))}
            </div>
        );
    };

    const calculateDRates = () => {
        if (mainRate) {
            return Array.from({ length: 9 }, (_, i) => {
                const dValue = (i + 1) / 10;
                const cValue = Math.round(mainRate * dValue);

                return `${dValue.toFixed(1)}D = ${cValue}c`;
            });
        }

        return [];
    };

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!apiResponse) {
        return <p className="loading-message">加載中...</p>;
    }

    return (
        <div className="exchange-container">
            <header className="exchange-title">神聖混沌即時比值</header>
            <a href={officialLink} target="_blank" rel="noopener noreferrer" className="exchange-official-link">
                官方連結
            </a>
            <div className="exchange-rates">
                <h3 className="exchange-subtitle">目前1D換C的價格，取官網前10筆</h3>
                <h1 className="exchange-subtitle">第 1 ~ 10 筆：</h1>
                {renderExchangeRates()}
            </div>
            <div className="exchange-main-rate">
                <h3 className="exchange-subtitle">換算成c：</h3>
                <h6 className="exchange-note">"取第二筆為基準作換算，小數點無條件捨去"</h6>
                    <div className="exchange-rate-wrapper">
                        <ul className="exchange-rate-list">
                            {calculateDRates().map((rate, index) => (
                                <li key={index}>{rate}</li>
                            ))}
                        </ul>
                        <div className="exchange-main-rate-display">
                                <span className="exchange-main-rate-value"> 1D = {mainRate}c</span>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default Exchange;