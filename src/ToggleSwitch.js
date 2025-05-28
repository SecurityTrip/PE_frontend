// ToggleSwitch.js
import React from 'react';

const ToggleSwitch = ({ checked, onChange, style }) => (
    <label style={{ ...style, position: 'absolute' }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            style={{ display: 'none' }}
        />
        <span style={{
            display: 'inline-block',
            width: '5vh',
            height: '3vh',
            backgroundColor: checked ? '#4caf50' : '#ccc',
            borderRadius: '3vh',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
        }}>
            <span style={{
                content: '',
                position: 'absolute',
                height: '2.5vh',
                width: '2.5vh',
                left: checked ? '2.3vh' : '0.3vh',
                bottom: '0.25vh',
                backgroundColor: 'white',
                transition: 'left 0.3s',
                borderRadius: '50%'
            }} />
        </span>
    </label>
);

export default ToggleSwitch;