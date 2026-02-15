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
    currFolder = folder;

    let response = await fetch(`/${folder}/info.json`);
    let data = await response.json();

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
    currentSong.src = `/${currFolder}/` + encodeURIComponent(track);

console.log("Playing from:", `/${currFolder}/` + encodeURIComponent(track));


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

    let folders = ["ncs"];   // add more folders here later

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of folders) {

        let res = await fetch(`/songs/${folder}/info.json`);
        let data = await res.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">▶</div>
                <img src="/songs/${folder}/cover.jpg">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
    }

    // click event
    Array.from(document.getElementsByClassName("card")).forEach(card => {

        card.addEventListener("click", async (e) => {

            let folder = e.currentTarget.dataset.folder;

            songs = await getSongs(`songs/${folder}`);

            playMusic(songs[0]);

        });

    });

}


async function main() {

    // Get all the songs
    let savedFolder = localStorage.getItem("currentFolder") || "songs/ncs";

    await getSongs(savedFolder);

    // Display  all the albums on the page
    displayAlbums();

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