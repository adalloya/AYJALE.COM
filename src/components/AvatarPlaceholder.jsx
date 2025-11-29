import React from 'react';
import placeholderImg from '../assets/placeholder_casquito.png';

const AvatarPlaceholder = ({ className = "w-24 h-24" }) => {
    return (
        <div className={`${className} rounded-full bg-slate-200 flex items-center justify-center overflow-hidden relative border-2 border-slate-300`}>
            <img
                src={placeholderImg}
                alt="Avatar Placeholder"
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default AvatarPlaceholder;
