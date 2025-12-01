import React from 'react';

export const PhoneFrame = ({ children, className = "" }) => {
    return (
        <div className={`relative mx-auto border-slate-800 bg-slate-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl ${className}`}>
            <div className="h-[32px] w-[3px] bg-slate-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-slate-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-slate-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-slate-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                {children}
            </div>
        </div>
    );
};

export const BrowserFrame = ({ children, className = "" }) => {
    return (
        <div className={`bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden ${className}`}>
            {/* Browser Header */}
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 bg-white rounded-md h-6 text-xs text-slate-400 flex items-center px-3">
                    ayjale.com/dashboard
                </div>
            </div>
            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};
