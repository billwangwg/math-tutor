
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function Setup({ onViewChange, onProcessImage }) {
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件 (JPG/PNG)');
            return;
        }
        onProcessImage(file);
    };

    return (
        <div className="glass-panel fade-in">
            <div className="text-center mb-8">
                <img
                    src="jzjjb.png"
                    alt="Logo"
                    className="w-20 md:w-24 h-auto mx-auto mb-4 rounded-2xl shadow-lg transition-all duration-300"
                />
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-blue-400 mb-2">
                    家长急救包
                </h1>
                <p className="text-gray-500 text-lg tracking-widest">按图索骥，爸妈有方</p>
            </div>

            <div
                className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <Upload size={48} className="text-violet-500 mb-4 mx-auto" style={{ color: '#805ad5', marginBottom: '1rem' }} />
                <h3 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>点击或拖拽上传题目图片</h3>
                <p style={{ color: '#718096' }}>支持 JPG, PNG 格式</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
}
