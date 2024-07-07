import React, { Component } from 'react';

class Items extends Component {
    state = { apiResponse: null, error: null };

    async callAPI() {
        try {
            const response = await fetch("https://poe-regex-tw-backend.vercel.app/api/v1/items");
            const data = await response.text();
            this.setState({ apiResponse: data });
        } catch (error) {
            this.setState({ error: '無法加載數據。' });
        }
    }

    componentDidMount() {
        this.callAPI();
    }

    renderContent() {
        const { apiResponse, error } = this.state;
        if (error) {
            return <p>錯誤：{error}</p>;
        }
        return apiResponse ? <p>{apiResponse}</p> : <p>加載中...</p>;
    }

    render() {
        return (
            <div>
                <h2>物品詞綴</h2>
                {this.renderContent()}
            </div>
        );
    }
}

export default Items;