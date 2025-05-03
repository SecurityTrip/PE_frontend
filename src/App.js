import './App.css';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import logolabelimg from './лого_надпись.png';
import logoimgimg from './лого_корабль.png';
import { BrowserRouter as Router, Route, Routes, useNavigate,Link } from 'react-router-dom';
import avaimg0 from './avas/avaimg0.gif';
import avaimg1 from './avas/avaimg1.gif';
import avaimg2 from './avas/avaimg2.gif';
import avaimg3 from './avas/avaimg3.gif';
import avaimg4 from './avas/avaimg4.gif';
import avaimg5 from './avas/avaimg5.gif';
import avaimg6 from './avas/avaimg6.gif';
import avaimg7 from './avas/avaimg7.gif';
import avaimg8 from './avas/avaimg8.gif';
import avaimg9 from './avas/avaimg9.gif';
import p1 from './ps/p1.png';
import p2 from './ps/p2.png';
import p3 from './ps/p3.png';
import p4 from './ps/p4.png';
function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/regis" element={<Regis />} />
                    <Route path="/singleplayer" element={<Singleplayer />} />
                    <Route path="/createroom" element={<CreateRoom />} />
                    <Route path="/connect" element={<Connect />} />
                    <Route path="/profset" element={<ProfSet />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/system" element={<System />} />
                    <Route path="/fieldedit" element={<FieldEdit />} />
                </Routes>
            </div>
        </Router>
    );
}

function Auth() {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [pass, setPass] = useState('');
    function handleClick() {
        navigate('/singleplayer'); // Навигация на другую страницу
    }

    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
            <div className="logintab">Авторизация</div>
            <div className="logintabdark">
                <input onChange={(e) => setLogin(e.target.value)} type="text" placeholder="Логин" className="loginput" style={{ top: '11.5vh' } } />
                <input onChange={(e) => setPass(e.target.value)} type="text" placeholder="Пароль" className="loginput" />
                <button onClick={handleClick} className="logbutton">Войти</button>
            </div>
            <Link to="/regis" className="linkToReg">Зарегистрироваться</Link>
        </header>
    );
}
function Regis() {
    const navigate = useNavigate();
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    const [iSeld, setISeld] = useState(0);

    const [login, setLogin] = useState('');
    const [pass, setPass] = useState('');
    const [passpass, setPassPass] = useState('');
    function handleClick() {
        navigate('/singleplayer'); // Навигация на другую страницу
    }
    function avaSelect(i) {
        setISeld(i);
        switch (i) {
            case 0: {
                setSelavx(-3.5); setSelavy(5.5);
                break;
            }
            case 1: {
                setSelavx(6.5); setSelavy(5.5);
                break;
            }
            case 2: {
                setSelavx(16.5); setSelavy(5.5);
                break;
            }
            case 3: {
                setSelavx(26.5); setSelavy(5.5);
                break;
            }
            case 4: {
                setSelavx(36.5); setSelavy(5.5);
                break;
            }
            case 5: {
                setSelavx(-3.5); setSelavy(15.5);
                break;
            }
            case 6: {
                setSelavx(6.5); setSelavy(15.5);
                break;
            }
            case 7: {
                setSelavx(16.5); setSelavy(15.5);
                break;
            }
            case 8: {
                setSelavx(26.5); setSelavy(15.5);
                break;
            }
            case 9: {
                setSelavx(36.5); setSelavy(15.5);
                break;
            }
            default: {
                alert('ничего себе');
            }
        }
    }
    
    return (

        <header>
            <div className="bckgr"></div>
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
            <div className="regtab">Регистрация</div>
            <div className="regtabdark">
                <input onChange={(e) => setLogin(e.target.value)} type="text" placeholder="Логин" className="reginput" />
                <input onChange={(e) => setPass(e.target.value)} type="text" placeholder="Пароль" className="reginput" style={{ top: '11.5vh' }} />
                <input onChange={(e) => setPassPass(e.target.value)} type="text" placeholder="Повторите пароль" className="reginput" style={{ top: '18vh' }} />
                <button onClick={handleClick} className="regbutton">Зарегистрироваться</button>
                <div style={{position: 'absolute',color: 'white',left: 'calc(50% + 4vh)',fontSize:'4vh'} }>Выберите аватар:</div>
                <SelectedAva x={selavx} y={selavy}></SelectedAva>
                <Avatimbut y='7' x='-2' img={avaimg0} onClick={() => { avaSelect(0) }} />
                <Avatimbut y='7' x='8' img={avaimg1} onClick={() => { avaSelect(1) }} />
                <Avatimbut y='7' x='18' img={avaimg2} onClick={() => { avaSelect(2) }} />
                <Avatimbut y='7' x='28' img={avaimg3} onClick={() => { avaSelect(3) }} />
                <Avatimbut y='7' x='38' img={avaimg4} onClick={() => { avaSelect(4) }} />
                <Avatimbut y='17' x='-2' img={avaimg5} onClick={() => { avaSelect(5) }} />
                <Avatimbut y='17' x='8' img={avaimg6} onClick={() => { avaSelect(6) }} />
                <Avatimbut y='17' x='18' img={avaimg7} onClick={() => { avaSelect(7) }} />
                <Avatimbut y='17' x='28' img={avaimg8} onClick={() => { avaSelect(8) }} />
                <Avatimbut y='17' x='38' img={avaimg9} onClick={() => { avaSelect(9) }} />
            </div>
            <Link to="/" className="linkToLogin">У меня уже есть аккаунт, войти</Link>
            
        </header>
    );
}
function Avatimbut({ y, x, img,onClick }) {
    return (
        <img alt="avatar_img" src={img } className="avatarimgbut" onClick={ onClick} style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh', backgroundSize: 'cover'  } }></img>
    );
}
function SelectedAva({y,x }) {
    return (
        <div className="selectedAva" style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh' }} ></div>
    );
}
function SelectedMenu({ y }) {
    return (
        <div className="selectedMenu" style={{ top: 'calc(' + y + '*7vh + 29.5vh)' }} ></div>
    );
}
function Singleplayer() {
    const [selected, setSelected] = useState(0);  // 0 = легкий, 1 = средний, 2 = сложный
    const navigate = useNavigate();
    const handleClick = (index) => {
        setSelected(index);
    };
    const playClick = (index) => {
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
function CreateRoom() {
    const navigate = useNavigate();
    const copyClick = (index) => {
        navigate('/fieldedit');
    };
    return (

        <MenuComponent selctdMenu='1'>
            <div style={{
                position: 'absolute',
                top: '20vh',
                left: '0vh',
                width: '100vh',
                height: '0vh',
                transform: 'translate(-50 %, -50 %)'
            }}>
                Сгенерированный код:
            </div>
            <input type="text" value="fcbqn8r73y9of87ew" className="sgencodefield" />
            <button onClick={copyClick} className="copybutt">Скопировать</button>
        </MenuComponent>
    );
}
function Connect() {
    const navigate = useNavigate();
    const copyClick = (index) => {
        navigate('/fieldedit');
    };
    return (
        <MenuComponent selctdMenu='2'>
            <div style={{
                position: 'absolute',
                top: '20vh',
                left: '0vh',
                width: '100vh',
                height: '0vh',
                transform: 'translate(-50 %, -50 %)'
            }}>
                Введите код комнаты:
            </div>
            <input type="text" className="sgencodefield" />
            <button onClick={copyClick} className="copybutt">Войти</button>
        </MenuComponent>
    );
}
function ProfSet() {
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    function saveClick() {

    }
    return (
        <MenuComponent selctdMenu='3'>
            <div style={{ position: 'absolute', top: '10vh', left: '15vh', fontSize: '6vh' }}>Аватар:</div>
            <SelectedAva x={selavx} y={selavy}></SelectedAva>
            <Avatimbut y='7' x='-2' img={avaimg0} onClick={() => { setSelavx(-3.5); setSelavy(5.5); }} />
            <Avatimbut y='7' x='8' img={avaimg1} onClick={() => { setSelavx(6.5); setSelavy(5.5); }} />
            <Avatimbut y='7' x='18' img={avaimg2} onClick={() => { setSelavx(16.5); setSelavy(5.5); }} />
            <Avatimbut y='7' x='28' img={avaimg3} onClick={() => { setSelavx(26.5); setSelavy(5.5); }} />
            <Avatimbut y='7' x='38' img={avaimg4} onClick={() => { setSelavx(36.5); setSelavy(5.5); }} />
            <Avatimbut y='17' x='-2' img={avaimg5} onClick={() => { setSelavx(-3.5); setSelavy(15.5); }} />
            <Avatimbut y='17' x='8' img={avaimg6} onClick={() => { setSelavx(6.5); setSelavy(15.5); }} />
            <Avatimbut y='17' x='18' img={avaimg7} onClick={() => { setSelavx(16.5); setSelavy(15.5); }} />
            <Avatimbut y='17' x='28' img={avaimg8} onClick={() => { setSelavx(26.5); setSelavy(15.5); }} />
            <Avatimbut y='17' x='38' img={avaimg9} onClick={() => { setSelavx(36.5); setSelavy(15.5); }} />
            <input style={{top: '33vh'}} type="text" placeholder="Новый логин" className="profSetInputs" />
            <input style={{ top: '40vh' }} type="text" placeholder="Старый пароль" className="profSetInputs" />
            <input style={{ top: '47vh' }} type="text" placeholder="Новый пароль" className="profSetInputs" />
            <input style={{ top: '54vh' }} type="text" placeholder="Повторите пароль" className="profSetInputs" />
            <button onClick={saveClick} className="savebutt">Сохранить изменения</button>
        </MenuComponent>        
    );
}
function Rules() {
    
    return (
        <MenuComponent selctdMenu='4'>
            <div className='rulesScroll'>
                fkj;ajksdj vkajsh dkjg;kajs;kvjh a;kjs hd;lkfgjha;kjvhwrijhgfkuah dfkj ha;ksd h;fa shd;vkhaoi w hgoihaoiv h[oaej v[oj a[osd jfo iasoif j[oais jdvoia j[soidjg[oia usoidjf[oiasj d[ofi[vo iasj[ofijgo[ ia sjd[ofij aosi djgvaslkdh f;as hd;lfkh ;lk;fa shd;k jfh;oais dovhas;jdh fkljh aslkjdhfklj hjhaskj dhkjhab sjkfh jkhasdjhf jahshdjkvhaklsdhflkjhasdk jfkasjlfkjashdkljfhaslkjd hfkjsad flsad fkaslkjf l;asjd;lkfaskf lask fljfakjshdkfjjalksjflkj aslkdlk alsk flasjdl kfjasljaslk jalsk lkas jlkajs lkjsl kafj alksdj
            </div>
        </MenuComponent>
    );
}
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
function MenuComponent({ selctdMenu, children }) {
    const navigate = useNavigate();
    function Single() {
        navigate('/singleplayer'); // Навигация на другую страницу
    }
    function CrRoom() {
        navigate('/createroom'); // Навигация на другую страницу
    }
    function Conn() {
        navigate('/connect'); // Навигация на другую страницу
    }
    function ProfSt() {
        navigate('/profset'); // Навигация на другую страницу
    }
    function Ruls() {
        navigate('/rules'); // Навигация на другую страницу
    }
    function AbAuth() {
        navigate('/about'); // Навигация на другую страницу
    }
    function Syst() {
        navigate('/system'); // Навигация на другую страницу
    }
    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
            <div className="menuTab">
                <label onClick={Single}>Одиночная игра</label><br />
                <label onClick={CrRoom}>Создать комнату</label><br />
                <label onClick={Conn}>Подключиться</label><br />
                <label onClick={ProfSt}>Настроить профиль</label><br />
                <label onClick={Ruls}>Правила игры</label ><br />
                <label onClick={AbAuth}>Об авторах</label ><br />
                <label onClick={Syst}>О системе</label ><br />
            </div>
            <SelectedMenu y={selctdMenu}></SelectedMenu>
            <div className="menuBigTab">{children}</div>
        </header>
    );
}
function FieldEdit() {
    const navigate = useNavigate();
    const [movinShip, setMS] = useState(-1);
    function handleClick() {
        navigate('/match');
    }
    const [mos, setMos] = useState(null);

    const grid = useMemo(() => {
        let trt = []
        let id = 0;
        for (let y = 0; y < 10; y++)
            for (let x = 0; x < 10; x++) {
                trt.push({ id, x, y });
                id++;
            }
                
        return trt;
    })
    function MouseDown(e,i) {
        setMos([e.screenX, e.screenY]);
        const ships = shipsRef.current;
        ships[i].px = ships[i].rqx;
        ships[i].py = ships[i].rqy;
        setMS(i);
    }
    function MouseMove(e) {
        if (movinShip > -1) {
            const ships = shipsRef.current;
            ships[movinShip].rqx = ships[movinShip].px + (e.screenX - mos[0]);
            ships[movinShip].rqy = ships[movinShip].py + (e.screenY - mos[1]);
            console.log(ships[movinShip].rqy,movinShip);
        }
    }
    function MouseUp(e) {
        if (movinShip > -1) {
            const ships = shipsRef.current;
            ships[movinShip].rqx = ships[movinShip].px + (e.x - mos[0]);
            ships[movinShip].rqy = ships[movinShip].py + (e.y - mos[1]);
            let qbob = scrtogrid(ships[movinShip].rqx);
            let bbob = scrtogrid(ships[movinShip].rqy);
            ships[movinShip].rqx = gridtoscr(qbob);
            ships[movinShip].rqy = gridtoscr(bbob);
            //for (let y = 0; y < 10; y++)
            //    for (let x = 0; x < 10; x++) {
            //        if (field[y][x] == 1) field[y][x] = 0;
            //    }
            //переделать под проверку поля всего
            if (mos[0] == e.x && mos[1] == e.y) {
                if (ships[movinShip].rot == 0)
                    ships[movinShip].rot = 1;
                else
                    ships[movinShip].rot = 0;
            }
            //переделать под проверку поля всего
            //if (bbob >= 0 && bbob < 10 && qbob >= 0 && qbob < 10)
            //    field[bbob][qbob] = 1;
            //if (ships[imove].rot == 0) {
            //    if (bbob >= 0 && bbob < 10 && qbob+1 >= 0 && qbob+1 < 10)
            //        field[bbob][qbob + 1] = 1;
            //    if (bbob >= 0 && bbob < 10 && qbob+2 >= 0 && qbob+2 < 10)
            //        field[bbob][qbob + 2] = 1;
            //    if (bbob >= 0 && bbob < 10 && qbob+3 >= 0 && qbob+3 < 10)
            //    field[bbob][qbob + 3] = 1;
            //}
            //else {
            //    if (bbob+1 >= 0 && bbob+1 < 10 && qbob >= 0 && qbob < 10)
            //        field[bbob + 1][qbob] = 1;
            //    if (bbob+2 >= 0 && bbob+2 < 10 && qbob >= 0 && qbob < 10)
            //        field[bbob + 2][qbob] = 1;
            //    if (bbob+3 >= 0 && bbob+3 < 10 && qbob >= 0 && qbob < 10)
            //    field[bbob + 3][qbob] = 1;
            //}


            setMos(null)
            setMS(-1);
        }
    }
    const lastFrameTime = useRef(0);
    const requestRef = useRef();
    const [tick, setTick] = useState(0);
    const render = (time) => {
        // Вызывается каждый кадр (60 Гц ≈ каждые 16.6 мс)
        const deltaTime = time - lastFrameTime.current;
        lastFrameTime.current = time;
        for (let i = 0; i < 9; i++) {

            const ships = shipsRef.current;
            ships[i].tx += (ships[i].rqx - ships[i].tx) * 0.1;
            ships[i].ty += (ships[i].rqy - ships[i].ty) * 0.1;

            console.log(ships[8]);
        }
        setTick(t => t + 1); // заставляем React перерисоваться
        // Перезапустить цикл
        requestRef.current = requestAnimationFrame(render);
    };
    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
    function scrtogrid(pos) {
        return Math.round(pos / 1 - 1.5);
    }
    function gridtoscr(pos) {
        return (pos + 1.5) * 1;
    }
    const shipsRef =useRef( [
        {
            px: gridtoscr(14),
            py: gridtoscr(3),
            rqx: gridtoscr(14),
            rqy: gridtoscr(3),
            tx: gridtoscr(14),
            ty: gridtoscr(3),
            len: 1,
            rot: 0
        },
        {
            px: gridtoscr(13),
            py: gridtoscr(3),
            rqx: gridtoscr(13),
            rqy: gridtoscr(3),
            tx: gridtoscr(13),
            ty: gridtoscr(3),
            len: 1,
            rot: 0
        },
        {
            px: gridtoscr(12),
            py: gridtoscr(3),
            rqx: gridtoscr(12),
            rqy: gridtoscr(3),
            tx: gridtoscr(12),
            ty: gridtoscr(3),
            len: 1,
            rot: 0
        },
        {
            px: gridtoscr(11),
            py: gridtoscr(3),
            rqx: gridtoscr(11),
            rqy: gridtoscr(3),
            tx: gridtoscr(11),
            ty: gridtoscr(3),
            len: 1,
            rot: 0
        },
        {
            px: gridtoscr(13),
            py: gridtoscr(2),
            rqx: gridtoscr(13),
            rqy: gridtoscr(2),
            tx: gridtoscr(13),
            ty: gridtoscr(2),
            len: 2,
            rot: 0
        },
        {
            px: gridtoscr(11),
            py: gridtoscr(2),
            rqx: gridtoscr(11),
            rqy: gridtoscr(2),
            tx: gridtoscr(11),
            ty: gridtoscr(2),
            len: 2,
            rot: 0
        },
        {
            px: gridtoscr(14),
            py: gridtoscr(1),
            rqx: gridtoscr(14),
            rqy: gridtoscr(1),
            tx: gridtoscr(14),
            ty: gridtoscr(1),
            len: 3,
            rot: 0
        },
        {
            px: gridtoscr(11),
            py: gridtoscr(1),
            rqx: gridtoscr(11),
            rqy: gridtoscr(1),
            tx: gridtoscr(11),
            ty: gridtoscr(1),
            len: 3,
            rot: 0
        },
        {
            px: 0,
            py: 0,
            rqx: 0,
            rqy: 0,
            tx: 0,
            ty: 0,
            len: 4,
            rot: 0
        },
    ])
    const ships = shipsRef.current;
    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <div className="fieldEditBigTab" onMouseUp={(e) => MouseUp(e)} onMouseMove={(e)=>MouseMove(e)}>
                {grid.map(el =>
                    <div key= {el.id} style={{
                        
                        position: 'absolute',
                        left: el.x*7.7 + 3+'vh',
                        top: el.y*7.7 + 3 + 'vh',
                        width: '7vh',
                        height: '7vh',
                        backgroundColor: 'rgb(0,0,0,0.5)',
                        borderRadius:'1vh'
                    }}></div>
                )
                }
                <label style={
                    {
                        position: 'absolute',
                        left: '85vh',
                        top: '52vh',
                    }
                }>Расставить автоматически:</label>
                <button className='fieldButt' style={{ top: '60vh' }}>Случайно</button>
                <button className='fieldButt' style={{ top: '67vh' }}>Береговой метод</button>
                <button className='fieldButt' style={{ top: '74vh' }}>Ассиметричный метод</button>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 8)} src={p4} style={{ height: '5.3vh', position: 'absolute', transform: 1 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[8].tx * 7.7 + 'vh', top: 3.8 + ships[8].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,1)} src={p3} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '3.8vh', top: '11.5vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,2)} src={p3} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '26.9vh', top: '11.5vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,3)} src={p2} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '3.8vh', top: '19.2vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,4)} src={p2} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '19.2vh', top: '19.2vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,5)} src={p2} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '34.6vh', top: '19.2vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,6)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '3.8vh', top: '26.9vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,7)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '11.5vh', top: '26.9vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,0)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '3.8vh', top: '26.9vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e,9)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: 0 ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: '3.8vh', top: '26.9vh' }}></img>
            </div>

        </header>
    );
}

export default App;