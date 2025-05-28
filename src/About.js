import React from 'react';
import MenuComponent from './MenuComponent'; // assuming MenuComponent is now in its own file

function About() {
    return (
        <MenuComponent selctdMenu='5'>
            {/*<div style={{ textAlign: 'left', position: 'absolute',width:'90vh', top: '50%', left: '50%', transform:'translate(-50%, -50%)' } }>*/}
            <div style={{textAlign: 'center', marginLeft: '50px', marginRight: '50px', lineHeight: '5vh', fontSize: '3vh'}}>
                <br/><br/>
                Самарский университет <br/>
                Институт информатики и кибернетики<br/>
                <b>Курсовой проект по дисциплине "Программная инженерия"</b><br/>
                «Приложение «Игра «Морской бой»<br/>
                Разработчики - обучающиеся группы 6303-020302D:<br/>
                Лебедев Е.М.<br/>
                Лысов И.Д.<br/>
                Паршин Н.А.<br/>
                Самара 2025<br/>
            </div>
            {/*</div>*/}
        </MenuComponent>
    );
}

export default About; 