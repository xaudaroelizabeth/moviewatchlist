/* KEY 1b943a4e */
/* POSTER API REQUESTS ('http://img.omdbapi.com/?apikey=[1b943a4e]&') */

const searchButtonEl = document.getElementById('search-button');
const searchInputEl = document.getElementById('search-input');
const moviesContainerEl = document.getElementById('movies-container');
let copyMoviesData = [];

/*------ SEARCH MOVIES ------*/
async function search() {
  const query = searchInputEl.value;
  const response = await fetch(`https://www.omdbapi.com/?apikey=1b943a4e&s=${query}&type=movie`);
  const data = await response.json();
  console.log(data);

  if (data.Response === "True") {
    const moviesDetails = await Promise.all(
      data.Search.map(async (movie) => {
        const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=1b943a4e&i=${movie.imdbID}`);
        return await detailResponse.json();
      })
    );

    copyMoviesData = moviesDetails;
    renderMovies(moviesDetails, "home");
  } else {
    moviesContainerEl.innerHTML = `<p class="no-data-text">Unable to find what you're looking for. Please try another search.</p>`;
  }
}

if (searchButtonEl) {
  searchButtonEl.addEventListener('click', search);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      search();
    }
  });
}

/*------ RENDER MOVIES ------*/
function renderMovies(data, page) {
  let newArray = data.map(movie => {
    return `
      <div class="movies-container">
        <div class="poster-container">
          <img class="poster" src="${movie.Poster}" />
        </div>
        <div class="movie-details">
          <div class="title-container">
            <div class="title">${movie.Title}</div>
            <div class="rating-container">
              <img class="star-icon" src="/images/starIcon.png" />
              <div class="rating">${movie.imdbRating}</div>
            </div>
          </div>
          <div class="minutes-container">
            <div class="runtime">${movie.Runtime}</div>
            <div class="genre">${movie.Genre}</div>
            <div id="addRemove-watchlist" class="watchlist-container">
              <img data-movie="${movie.imdbID}" class="plus-icon"
                ${page === "home"
                  ? `src="images/iconPlusSignLightMode.png"`
                  : `src="images/iconMinusSign.png"`}>
              Watchlist
            </div>
          </div>
          <div class="plot-container">
            <div class="plot">${movie.Plot}</div>
          </div>
        </div>
      </div>
    `;
  });

  moviesContainerEl.innerHTML = newArray.join("");
  updateIconsForTheme(); // Ensure icons match theme after rendering
}

/*------ ADD & REMOVE MOVIES FROM WATCHLIST ------*/
document.addEventListener("click", (e) => {
  const movieID = e.target.dataset.movie;
  if (!movieID) return;

  if (e.target.classList.contains('plus-icon')) {
    if (e.target.src.includes('PlusSign')) {
      const targetMovie = copyMoviesData.find(movie => movie.imdbID === movieID);
      
      if (targetMovie) addToWatchlist(targetMovie);
    } else if (e.target.src.includes('MinusSign')) {
      removeFromWatchlist(movieID);
      loadWatchlist();
    }
  }
});

function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(item => item != null);
  
  const exists = watchlist.find(item => item.imdbID === movie.imdbID);
  if (!exists) {
    watchlist.push(movie);
    
    
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert('Movie added to your watchlist!');
  }
}

function removeFromWatchlist(movieID) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(movie => movie.imdbID !== movieID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  alert("Movie removed from your watchlist!");
}

function loadWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const container = document.getElementById('movies-container');
  console.log(watchlist)
  if (watchlist.length === 0) {
    container.innerHTML = `
      <div id="empty-watchlist">Your watchlist is looking a little empty...</div>
      <div id="add-to-watchlist-container">  
        <div id="plus-icon-container" aria-label="Add movies to watchlist">
          <a href="index.html" aria-label="Add movies to watchlist">
            <img class="plus-icon-watchlist-page" src="images/iconPlusSignLightMode.png" alt="">
          </a>
        </div> 
        <div id="add-movies-text">Let's add some movies!</div>
      </div>
    `;
  } else {
    renderMovies(watchlist, "watchlist");
    
  }
}

/*------ AUTO THEME & ICON UPDATES ------*/
function updateIconsForTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  const plusIcons = document.querySelectorAll('.plus-icon');
  
  plusIcons.forEach(icon => {
    if (icon.src.includes('PlusSign')) {
      icon.src = isDark
        ? 'images/iconPlusSignDarkMode.png'
        : 'images/iconPlusSignLightMode.png';
        console.log("Icon source set to:", icon.src)
    } else if (icon.src.includes('MinusSign')) {
      icon.src = isDark
        ? 'images/iconMinusSignDark.png'
        : 'images/iconMinusSignLightMode.png';
    }
  });
}

function applyTheme(darkMode) {
  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  updateIconsForTheme();
  
  /*if (darkMode) {
   const noDataDarkImg = document.getElementById('no-data-img-container')
   console.log(noDataDarkImg)
    noDataDarkImg.innerHTML = `<img id="no-data-img" alt="Film reel Icon and the words Start Exploring" src="/images/no-data-initial-dark.png"/>` 
  }*/
}

function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(prefersDark.matches);

  prefersDark.addEventListener('change', e => {
    applyTheme(e.matches);
  });
}

/*------ DOM LOADED EVENT ------*/
document.addEventListener('DOMContentLoaded', () => {
  //initTheme();
  console.log(window.location.pathname)
  if (window.location.pathname.toLowerCase().includes('mywatchlist.html')) {
    loadWatchlist();
    console.log("test")
  }
});