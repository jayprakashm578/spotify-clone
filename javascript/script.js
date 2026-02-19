console.log("JavaScript Codes");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutes(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(seconds); // remove decimals
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return (
        String(minutes).padStart(2, '0') +
        ':' +
        String(secs).padStart(2, '0')
    );
}


async function getSongs(folder) {

    currFolder = folder;   // must be only "ncs"

    let res = await fetch(`/songs/${folder}/info.json`);
    let data = await res.json();

    songs = data.songs;

    
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    songs.forEach((song, index) => {
        songUL.insertAdjacentHTML("beforeend",
            `<li data-index="${index}">
                <img class="invert" src="/img/music.svg">
                <div class="info">
                    <div>${song}</div>
                    <div>${data.title}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="/img/play.svg">
                </div>
            </li>`
        );
    });

    return songs;
}



const playMusic = (track, pause = false) => {


    // Normalize filename
    track = decodeURIComponent(track.split("/").pop());

    // let audio=new Audio("/songs/"+track)
    currentSong.src = `/songs/${currFolder}/${encodeURIComponent(track)}`;

    // Save current song
    localStorage.setItem("currentSong", track);
    localStorage.setItem("currentFolder", currFolder);

    if (!pause) {

        currentSong.play();
        play.src = "/img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {

    let res = await fetch("/songs/albums.json");

    let data = await res.json();

    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of data.albums) {

        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                 <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                color="currentColor" fill="black" stroke="#141B34" stroke-width="1.5"
                                stroke-linejoin="round">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                            </svg>
                        </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>
        `;
    }

    // Click handler
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        });
    });
}


async function main() {
    await displayAlbums();
    // Display  all the albums on the page
    
    // Get all the songs
    let savedFolder = localStorage.getItem("currentFolder")|| "ncs";
    await getSongs(savedFolder);
    

    //    Attach an event listener to each song
    document.querySelector(".songlist").addEventListener("click", e => {
        const li = e.target.closest("li");
        if (!li) return;

        const index = li.dataset.index;
        if (index === undefined) return;

        playMusic(songs[index]);
    });

    // get saved song from localStorage
    let savedSong = localStorage.getItem("currentSong");

    if (savedSong && songs.includes(savedSong)) {
        playMusic(savedSong, true);   // load last song
    } else {
        playMusic(songs[0], true);    // fallback if no saved song
    }

    // Attach an event listener to play ,previous and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "/img/play.svg";
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.add("show")
    })

    // Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("show")
        document.querySelector(".left").classList.add("hide")
    });

    // Add an event listener for previous
    previous.addEventListener("click", () => {
        console.log("Previous Clicked");

        let index = songs.indexOf(
            decodeURIComponent(currentSong.src.split("/").pop())
        );
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }

    })

    // Add an event listener for  next
    next.addEventListener("click", () => {
        console.log("Next Clicked");
        let index = songs.indexOf(
            decodeURIComponent(currentSong.src.split("/").pop())
        );
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listener for next song
    currentSong.addEventListener("ended", () => {

        let index = songs.indexOf(
            decodeURIComponent(currentSong.src.split("/").pop())
        );

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });


    // Add an event to volumne
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target.value + "/100");
        currentSong.volume = parseInt(e.target.value) / 100
        currentSong.muted = false;
        currVolume.src = "/img/volume.svg";

    })

    // Add an event listener to volume
    let lastVolume = 1;
    let currVolume = document.querySelector(".volume img");

    currVolume.addEventListener("click", () => {
        if (!currentSong.muted) {
            lastVolume = currentSong.volume;
            currentSong.muted = true;
            currentSong.volume = 0;
            currVolume.src = "/img/volumemute.svg";
        } else {
            currentSong.muted = false;
            currentSong.volume = lastVolume || 1;
            currVolume.src = "/img/volume.svg";
        }
    })
}

main();