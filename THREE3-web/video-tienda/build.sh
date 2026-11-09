#!/bin/bash
# Reconstruye el video de tienda virtual: render -> + cierre con logo -> + locución sincronizada.
# Inicios de voz (ms): 300 4400 7600 16130 19500
set -e
cd "$(dirname "$0")"
node render.js tienda.html tienda-main.mp4 23.6
ffmpeg -v error -y -i tienda-main.mp4 -i assets/cierre-logo.mp4 -filter_complex "[1:v]fps=30,format=yuv420p[c];[0:v][c]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 18 -pix_fmt yuv420p sin-audio.mp4
ffmpeg -v error -y -i audio/t1.mp3 -i audio/t2.mp3 -i audio/t3.mp3 -i audio/t4.mp3 -i audio/t5.mp3 -i assets/cierre-logo.mp4 -filter_complex \
"[0]adelay=300|300[a];[1]adelay=4400|4400[b];[2]adelay=7600|7600[c];[3]adelay=16130|16130[d];[4]adelay=19500|19500[e];[a][b][c][d][e]amix=inputs=5:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7[v];[5:a]volume=.7,adelay=23600|23600[f];[v][f]amix=inputs=2:normalize=0,aformat=sample_rates=44100:channel_layouts=stereo[aout]" -map "[aout]" -ar 44100 mezcla.wav
ffmpeg -v error -y -i sin-audio.mp4 -i mezcla.wav -c:v copy -c:a aac -b:a 192k -shortest three3-tienda-virtual.mp4
rm -f tienda-main.mp4 sin-audio.mp4 mezcla.wav
