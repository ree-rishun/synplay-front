<template>
  <div id="video">
    <div id="controlArea" @mousemove="onMousemove" :style="'opacity:' + UI.opacity">

      <div class="pause" @click="pauseVideo" v-if="video.playing"></div>
      <div class="play" @click="playVideo" v-else></div>

      <div id="roomIDArea">
        <label>ROOM URL</label>
        <input type="text" v-model="roomURL" readonly>
      </div>

      <div id="menu">
        <div id="speaker_icon"></div>
        <input id="volume" type="range" v-model="video.volume" min="0" max="100">
      </div>
      <input type="range" id="timeLine" v-model="video.seek" min="0" :max="video.duration" @change="seekVideo" @click="seekClear">
      <div id="seek_bar">
        <span :style="'width:' +  video.seek / video.duration * 100 + '%'"></span>
      </div>
    </div>
    <div id="videoArea">
      <youtube :video-id="videoId" ref="youtube" @playing="playingVideo" playerVars="'controls': 0"></youtube>
    </div>
  </div>
</template>

<script>
    // import
    import Vue from 'vue';
    import VueYoutube from 'vue-youtube';
    import firebase from 'firebase';

    Vue.use(VueYoutube);
    // ソケット通信
    // let socketio = io();

    export default {
        data() {
            return {
                domain: 'http://192.168.0.15:8080',
                videoId: null,
                roomURL: null,
                roomData: [],
                video:{
                    playing: false,
                    seek: 0,
                    duration: 0,
                    volume: 50,
                },
                intervalID:{
                    seekID: null,
                    durationID: null,
                },
                timeoutID:{
                    UIopacityID: null,
                },
                interval:{
                    pickSeek: 200,    // 100では短過ぎて反応しないことがある
                    checkDuration: 100,
                    mousemove: 2000,
                },
                UI:{
                    opacity: 1,
                },
            }
        },
        methods:{
            buildPlayer(){
                clearInterval(this.intervalID.seekID);
                clearInterval(this.intervalID.durationID);
                this.intervalID.seekID = setInterval(
                    this.pickSeek,
                    this.interval.pickSeek);
                this.intervalID.durtionID = setInterval(
                    this.checkDuration,
                    this.interval.pickSeek);
            },
            seekClear(){
                clearInterval(this.intervalID.seekID);
            },
            pickSeek(){ // 現在のシークを取得
                const self = this;
                 this.player.getCurrentTime().then((time) => {
                     self.video.seek = Math.round(time * 10);
                });
            },
            checkDuration(){  // 動画全体の長さを取得
                const self = this;
                if(this.video.duration > 10){
                    clearInterval(self.intervalID.durationID);
                }
                this.player.getDuration().then((duration) => {
                    self.video.duration = Math.round(duration * 10);
                });
            },
            playVideo(){
                console.log(this.roomData.videoId);
                this.player.playVideo();
                this.player.height = 800;
                this.video.playing = true;
                this.buildPlayer();
                const self = this;
                this.timeoutID.UIopacityID = setTimeout(
                    function () {
                      self.UI.opacity = 0;
                    },
                    this.interval.mousemove
                );
            },
            pauseVideo(){
                this.player.pauseVideo();
                this.video.playing = false;
                clearInterval(this.intervalID.seekID);

            },
            playingVideo(){
                console.log('playing!');
            },
            seekVideo(){
                clearInterval(this.intervalID.seekID);
                const self = this;
                this.player.seekTo(this.video.seek / 10, true).then(() => {
                    if(self.video.playing){
                        self.buildPlayer();
                    }
                });
            },
            onMousemove(){
                clearTimeout(this.timeoutID.UIopacityID);
                this.UI.opacity = 1;
                const self = this;
                if(this.video.playing){
                    this.timeoutID.UIopacityID = setTimeout(
                        function () {
                            self.UI.opacity = 0;
                        },
                        this.interval.mousemove
                    );
                }
            },
        },
        mounted() {
            this.roomID = this.$route.params['id'];
            this.roomURL = this.domain + this.$route.path;

            // Firebaseと値を同期
            firebase
                .database()
                .ref("rooms/" + this.roomID)
                .on("value", snapshot => {
                    this.roomData = snapshot.val();
                    this.videoId = this.roomData.videoId;
                });
        },
        computed:{
            player(){
                return this.$refs.youtube.player;
            }
        },
    }
</script>

<style lang="scss">
  // 変数定義
  $main-acc-color: #ff1d47;

  *:focus {
    outline: none;
  }

  #videoArea{
    position: fixed;
    z-index: 1;
    display: inline-block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    iframe{
      width: 100%;
      height: 100%;
    }
  }

  #controlArea{
    position: fixed;
    z-index: 100;
    display: inline-block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    .play, .pause{
      display: inline-block;
      margin: 44vh 0 0 0;
      width: 8vw;
      height: 5vw;
      border-radius: 3px;
      cursor: pointer;
      background-color: rgba(50,50,50,0.5);
    }

    .play{
      background-image: url("../assets/img/play_icon.png");
      background-position: 56% center;
      background-size: 3vw;
      background-repeat: no-repeat;
      -webkit-transition: all 0.3s ease;
      -moz-transition: all 0.3s ease;
      -o-transition: all 0.3s ease;
      transition: all  0.3s ease;
      &:hover{
        background-color: rgba(213, 12, 42, 1);
      }
    }

    .pause{
      background-image: url("../assets/img/stop_icon.png");
      background-position: center;
      background-size: 3vw;
      background-repeat: no-repeat;
      -webkit-transition: all 0.3s ease;
      -moz-transition: all 0.3s ease;
      -o-transition: all 0.3s ease;
      transition: all  0.3s ease;
      &:hover{
        background-color: rgba(50,50,50,1);
      }
    }
  }

  #roomIDArea{
    position: fixed;
    z-index: 101;
    top: 3vh;
    left: 3vw;
    background: rgba(50,50,50,.6);
    height: 30px;
    line-height: 30px;
    color: #fff;
    padding-left: 1.5vw;
    border-left: solid 2px $main-acc-color;
    width: auto;
    //
    input[type='text']{
      text-align: center;
      background: rgba(255,255,255,.7);
      border: none;
      outline: none;
      font-size: 18px;
      line-height: 30px;
      height: 30px;
      vertical-align: top;
      padding: 0;
      width: 300px;
    }
    //
    label{
      font-size: 18px;
      margin-right: 0.5vw;
      height: 30px;
      line-height: 30px;
      vertical-align: top;
    }
  }



  /* --- 画質選択UI --- */
  #qualityList{
    position: fixed;
    z-index: 102;
    display: inline-block;
    width: auto;
    height: auto;
    padding-top: 5px;
    background: #222222;
    color: #fff;
    bottom: 100px;
    right: 2vw;
    li{
      display: block;
      width: auto;
      border-bottom: #fff 1px;
      line-height: 1.5em;
      padding: 0 5px;
      font-size: 0.7em;
      cursor: pointer;
      &:hover{
        color: $main-acc-color;
        background: #777777;
      }
    }
  }



  /* --- タイムライン操作UI --- */
  #timeLine[type="range"] {
    position: fixed;
    z-index: 103;
    -webkit-appearance: none;
    appearance: none;
    background-color: rgba(250,250,250,0);
    height: 5px;
    width: 100%;
    border-radius: 6px;
    left: 0;
    bottom: 40px;
  }

  #timeLine[type="range"] :focus,
  #timeLine[type="range"] :active {
    outline: none;
  }

  #timeLine[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    position: relative;
    width: 22px;
    height: 22px;
    display: block;
    background-color: $main-acc-color;
    border-radius: 50%;
    -webkit-border-radius: 50%;
  }

  #timeLine[type="range"]:active::-webkit-slider-thumb {
    //box-shadow: 0 0 0 4px rgba(255, 29, 71, .6);
    transition: .4s;
  }
  #seek_bar{
    position: fixed;
    z-index: 102;
    left: 0;
    bottom: 42px;
    height: 5px;
    width: 100%;
    background-color: rgba(250,250,250,.5);
    span{
      display: block;
      background: $main-acc-color;
      height: 5px;
      width: 0;
      padding-right: 5px;
    }
  }


  /* --- 音量 --- */
  #menu{
    display: inline-block;
    position: fixed;
    z-index: 100;
    width: 100%;
    height: 44px;
    left: 0;
    bottom: 0;
    background: rgba(50,50,50,1);
  }

  #volume[type='range']{
    position: fixed;
    z-index: 104;
    color: #fff;
    width: 100px;
    height: 4px;
    right: 20px;
    bottom: 17px;
    -webkit-appearance: none;
    appearance: none;
    background-color: rgba(250,250,250,.5);
    border-radius: 6px;
  }

  #volume[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    position: relative;
    width: 13px;
    height: 13px;
    display: block;
    background-color: $main-acc-color;
    border-radius: 50%;
    -webkit-border-radius: 50%;
  }

  #volume[type="range"]:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(255, 29, 71, .6);
    transition: .4s;
  }



  #speaker_icon{
    display: inline-block;
    position: fixed;
    z-index: 101;
    width: 25px;
    height: 40px;
    right: 140px;
    bottom: 0;
    opacity: 0.5;
    cursor: pointer;
    -webkit-transition: all 0.3s ease;
    -moz-transition: all 0.3s ease;
    -o-transition: all 0.3s ease;
    transition: all  0.3s ease;
  }
  .mute{
    background-image: url("../assets/img/volume_off.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 25px;
  }
  .unmute{
    background-image: url("../assets/img/volume_on.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 25px;
  }
</style>