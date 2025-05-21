import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuComponent from './MenuComponent'; // assuming MenuComponent will be extracted

function Singleplayer() {
    const [selected, setSelected] = useState(0);  // 0 = легкий, 1 = средний, 2 = сложный
    const navigate = useNavigate();
    const handleClick = (index) => {
        setSelected(index);
    };
    const playClick = () => {
        // Сохраняем выбранную сложность в localStorage
        let diff = 'EASY';
        if (selected === 1) diff = 'MEDIUM';
        if (selected === 2) diff = 'HARD';
        localStorage.setItem('singleplayer_difficulty', diff);
        navigate('/fieldedit');
    };

    return (
        <MenuComponent selctdMenu='0'>
            <div style={{
                position:'absolute',
                top: '20vh',
                left: '0vh',
                width: '50vh',
                height: '0vh',
                transform: 'translate(-50 %, -50 %)'
            }}>
                Сложность ИИ:
            </div>
            <div style={{
                position: 'absolute',
                top: '30vh',
                left: '10vh',
                width: '80vh',
                height: '7vh',
                transform: 'translate(-50 %, -50 %)',
                backgroundColor: 'rgb(255,255,255,0.5)',
                borderRadius: '5vh',
                flexDirection: 'row',
                whiteSpace: 'pre'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: selected * 33.33 + '%',
                    width: '33.33%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '5vh',
                    transition: 'left 0.3s ease',
                    zIndex: -1
                }} />
                <div style={{ zIndex: 100 }}>
                <label  onClick={() => handleClick(0)}>Легкий           </label>
                <label  onClick={() => handleClick(1)} >Средний       </label>
                    <label  onClick={() => handleClick(2)}>Сложный</label>
                </div>
                
                
            </div>
            <button onClick={playClick} className="singleplaybutt">Играть</button>
        </MenuComponent>
    );
}

export default Singleplayer; 