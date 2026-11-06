import { useEffect } from "react";

type Props = {
  play: boolean;
};

function AlertSound({ play }: Props) {

  useEffect(() => {

    if (!play) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    const audioContext = new AudioContextClass();

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 900;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.value = 0.2;

    oscillator.start();

    setTimeout(() => {

      oscillator.stop();
      audioContext.close();

    }, 300);

  }, [play]);

  return null;

}

export default AlertSound;