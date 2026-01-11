
import React from 'react';

export default function Loading({ log }) {
    return (
        <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h2 style={{ color: '#4a5568', marginBottom: '1rem' }}>AI 正在极速分析...</h2>
            <div className="spinner"></div>
            <div
                style={{
                    marginTop: '1.5rem',
                    color: '#805ad5',
                    fontWeight: 600,
                    minHeight: '1.5em',
                    transition: 'opacity 0.3s'
                }}
            >
                {log}
            </div>
            <p style={{ marginTop: '2rem', color: '#718096', fontSize: '0.9rem' }}>首次分析可能需要 15-30 秒，请耐心等待</p>
        </div>
    );
}
