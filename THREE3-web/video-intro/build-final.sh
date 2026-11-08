#!/bin/bash
# Reconstruye el video final: render -> cierre extendido -> voz sincronizada.
# Voces en audio/v1..v5.mp3 (ElevenLabs, voz Gael). Retardos en ms: 2400 6600 11700 18500 21200
set -e
node render.js intro-three3.html three3-main.mp4 21
ffmpeg -v error -y -i assets/cierre-logo.mp4 -vf "tpad=stop_mode=clone:stop_duration=2.4,fps=30,format=yuv420p" -an -t 4.93 -c:v libx264 -crf 18 cierre-ext.mp4
ffmpeg -v error -y -i three3-main.mp4 -i cierre-ext.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 18 -pix_fmt yuv420p video-sin-audio.mp4
ffmpeg -v error -y -i audio/v1.mp3 -i audio/v2.mp3 -i audio/v3.mp3 -i audio/v4.mp3 -i audio/v5.mp3 -filter_complex "[0]adelay=2400|2400[a];[1]adelay=6600|6600[b];[2]adelay=11700|11700[c];[3]adelay=18500|18500[d];[4]adelay=21200|21200[e];[a][b][c][d][e]amix=inputs=5:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7,aformat=sample_rates=44100:channel_layouts=stereo[aout]" -map "[aout]" -ar 44100 voz.wav
ffmpeg -v error -y -i video-sin-audio.mp4 -i voz.wav -c:v copy -c:a aac -b:a 192k -shortest three3-final-con-voz.mp4
rm -f three3-main.mp4 cierre-ext.mp4 video-sin-audio.mp4 voz.wav
