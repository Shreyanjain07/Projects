console.log("lets write javascript")
let currentSongs = new Audio();
let songs;
let currfolder;
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

        //Show all the songs in the playlist
    let songUL = document.querySelector(".libsongs").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class= "invert" src="svgs/music.svg" alt="">
            <div class="info">
                <div class="sname">${song.replaceAll("%20", " ")} </div>
                <div class="aname"> Shreyans </div>
                
            </div>
            <div class="pnow">Play now
                <img class="invert" src="svgs/play.svg" alt="">
            </div>
             
        </li>`;
    }


    //Attach an event listener to each song
    Array.from(document.querySelector(".libsongs").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })
    return songs;
}

function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const padZero = (num) => (num < 10) ? `0${num}` : num;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedTime = `${padZero(minutes)} : ${padZero(remainingSeconds)}`;
    return formattedTime;
}

const playMusic = (track, pause = false) => {
    // let audio =  new Audio("/songs/" + track) ;
    currentSongs.src = `/${currfolder}/` + track
    if (!pause) {
        currentSongs.play();
        play.src = "svgs/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];

            //Get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="cardimg "><img aria-hidden="false" draggable="false" loading="lazy"
                    src="/songs/${folder}/cover.jpg">
               <img class="insideplay" src="svgs/insideplay.svg" alt="">
            </div>
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist when clicked on a card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {


    // for getting the list of all the songs
    await getSongs("songs/all")
    playMusic(songs[0], true)

    //Display all the albums on the page 
    await displayAlbums()

    //Attach an event listener to event listener
    play.addEventListener("click", () => {
        if (currentSongs.paused) {
            currentSongs.play()
            play.src = "svgs/pause.svg"
        } else {
            currentSongs.pause()
            play.src = "svgs/play.svg"
        }

    })
    currentSongs.addEventListener("timeupdate", () => {
        // console.log(currentSongs.currentTime, currentSongs.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesAndSeconds(currentSongs.currentTime)} / ${secondsToMinutesAndSeconds(currentSongs.duration)}`;
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%";
    })

    //Adding an event listener to the seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSongs.currentTime = (currentSongs.duration) * percent / 100;
    })

    //Adding an event listenere for the hamburger button
    document.querySelector("#hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    //Adding an event listenere for the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })
    //Add an event listener to previos and next buttons 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSongs.volume = parseInt(e.target.value) / 100
        if (currentSongs.volume > 0) {
            document.querySelector(".volume>img").src = "svgs/volume.svg"
        }
    
    })

    //Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=> {
        if (e.target.src.includes("volume.svg")) {
            e.target.src ="svgs/mute.svg"
            currentSongs.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = "svgs/volume.svg";
            currentSongs.volume = .5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })

 
}


main()

