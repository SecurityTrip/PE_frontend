import React from 'react';
import MenuComponent from './MenuComponent'; // assuming MenuComponent is now in its own file

function System() {
    return (
        <MenuComponent selctdMenu='6'>
            <div style={{ textAlign:'left', position: 'absolute', width: '90vh', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Тип ЭВМ: IBM PC совместимый<br />
                Монитор: с разрешающей способностью не ниже 800x600<br />
                Манипулятор: мышь
            </div>
        </MenuComponent>
    );
}

export default System; 