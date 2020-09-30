<template>
  <div>
    <div>
      <input type="text" v-model="videoId">
    </div>
    <youtube :video-id="videoId" ref="youtube" @playing="playingVideo"></youtube>
    <div>
      <button @click="pauseVideo" v-if="playing">pause</button>
      <button @click="playVideo" v-else>play</button>
    </div>
  </div>
</template>

<script>
    import Vue from 'vue'
    import VueYoutube from 'vue-youtube'

    Vue.use(VueYoutube)

    export default {
        data(){
            return{
                videoId: null,
                playing: false,
            }
        },
        methods:{
            playVideo(){  // 再生処理
                this.player.playVideo()
                this.playing = true
                this.player.getDuration().then((duration) => {
                    console.log(duration)
                })
            },
            pauseVideo(){ // 停止処理
                this.player.pauseVideo()
                this.playing = false
            },
            playingVideo(){
                console.log('play start!')
            },
            printTime(){
                this.player.getCurrentTime().then((time) => {
                    console.log('time:' + time)
                });
            },
        },
        created() {
        },
        beforeCreate() {
        },
        beforeMount() {
            this.videoId = 'SiAuAJBZuGs';
        },
        mounted() {
            setInterval(
                this.printTime,
                500
            )
        },
        computed:{
            player(){
                return this.$refs.youtube.player
            }
        }
    }
</script>

<style scoped>

</style>