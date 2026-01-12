
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
                <div className="mb-6 relative group inline-block">
                    <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
                    <img
                        src="/final_logo.png"
                        alt="家长急救包"
                        className="w-32 md:w-40 h-auto mx-auto relative transform transition-transform duration-500 hover:scale-105"
                    />
                </div>
                <p className="text-gray-500 text-lg tracking-widest mt-2">按图索骥，爸妈有方</p>
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

            {/* Shooting Guide */}
            <div className="mt-8 pt-8 border-t border-gray-200/30">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">拍摄标准示范</h4>
                <div className="bg-white/50 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-1/2">
                        <img
                            src="/shooting_guide_example.png"
                            alt="Standard Shooting Example"
                            className="w-full rounded-lg shadow-sm border border-gray-200"
                        />
                        <p className="text-xs text-center text-gray-500 mt-2">标准拍摄示例</p>
                    </div>
                    <div className="w-full md:w-1/2 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 text-sm font-bold">1</span>
                            </div>
                            <p className="text-sm text-gray-600"><strong>完整拍全：</strong>包含完整的题干文字和图形，不要截断。</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-sm font-bold">2</span>
                            </div>
                            <p className="text-sm text-gray-600"><strong>文字水平：</strong>尽量让题目文字保持水平，方便识别。</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-purple-600 text-sm font-bold">3</span>
                            </div>
                            <p className="text-sm text-gray-600"><strong>光线清晰：</strong>避免阴影遮挡文字，保持光线均匀充足。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
