import music from './sound/music.mp3';

import React from "react";

const MusicPlayer = ({ audioRef }) => {
    return (
        <audio ref={audioRef} src={music } loop />
    );
};

export default MusicPlayer;



