import React, { useState, useEffect, useRef } from "react";
import{ LocalVideoTrack } from 'twilio-video';

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [screenTracks, setScreenTracks] = useState([]);

  const screenStream = navigator.mediaDevices.getDisplayMedia();
  const track = screenStream.getTracks()[0];
  screenTracks = new LocalVideoTrack(track, {
  name: "user-screen",
});

  const videoRef = useRef();
  const audioRef = useRef();
  const screenRef = useRef();

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));
    setScreenTracks(trackpubsToTracks(participant.screenTracks));

    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      } else if (track.kind === "user-screen") {
        setScreenTracks((screenTracks) => [...screenTracks, track]);
      }
    };

    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      } else if (track.kind === "user-screen") {
        setScreenTracks((screenTracks) => screenTracks.filter((s) => s !== track));
      }
    };

    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      setScreenTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  useEffect(() => {
    const screenTrack = screenTracks[0];
    if (screenTrack) {
      screenTrack.attach(screenRef.current);
      return () => {
        screenTrack.detach();
      };
    }
  }, [screenTracks]);

  return (
    <div className="participant">
      <h3>{participant.identity}</h3>
      <video ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} muted={true} />
      <video ref={screenRef} autoPlay={true} />
    </div>
  );
};

export default Participant;
