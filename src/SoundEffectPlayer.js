import React, { useImperativeHandle, forwardRef, useRef } from "react";

const SoundEffectPlayer = forwardRef(({ src }, ref) => {
  const audioRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // ������ � ������
        audioRef.current.play().catch((err) => {
          console.warn("������ ��������������� �����", err);
        });
      }
    }
  }));

  return <audio ref={audioRef} src={src} preload="auto" />;
});

export default SoundEffectPlayer;