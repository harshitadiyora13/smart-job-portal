import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = ({ className = '' }) => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className={`btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center ${className}`}
            style={{ width: '40px', height: '40px', padding: '0' }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDarkMode ? (
                <Sun size={20} className="text-warning" />
            ) : (
                <Moon size={20} className="text-primary" />
            )}
        </button>
    );
};

export default DarkModeToggle;
