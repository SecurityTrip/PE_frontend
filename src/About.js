import React from 'react';
import MenuComponent from './MenuComponent'; // assuming MenuComponent is now in its own file

function About() {
    return (
        <MenuComponent selctdMenu='5'>
            <div style={{ textAlign: 'left', position: 'absolute',width:'90vh', top: '50%', left: '50%', transform:'translate(-50%, -50%)' } }>
                Фронтенд: Паршин Никита<br />
                Бекенд: Лысов Илья<br />
                Документация: Лебедев Евгений
            </div>
        </MenuComponent>
    );
}

export default About; 