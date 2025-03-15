const APIURL = "https://api.themoviedb.org/3/discover/movie?api_key=43f31050bba09e37742093b4117c606f&page=";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&api_key=43f31050bba09e37742093b4117c606f&query=";

const content = document.getElementById("content");
const search = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pageNumber = document.getElementById("page-number");

let currentMovies = [];
let currentPage = 1;
let totalPages = 1;
let currentQuery = "";
let isSearchActive = false;

getMovies(APIURL + currentPage);

async function getMovies(url) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Failed to fetch data");
        const respData = await resp.json();

        currentMovies = respData.results;
        totalPages = respData.total_pages;
        updatePagination();

        sortMovies("release_asc"); // Default sorting
    } catch (error) {
        console.error(error);
        content.innerHTML = "<p>Failed to load movies. Try again later.</p>";
    }
}

function showMovies(movies) {
    content.innerHTML = "";

    if (movies.length === 0) {
        content.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.forEach((movie) => {
        const { poster_path, title, vote_average, release_date } = movie;
        const imageUrl = poster_path ? IMGPATH + poster_path : "https://via.placeholder.com/300x450?text=No+Image";
        
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
        <img src="${imageUrl}" alt="${title}"/> 
        <div class="movie-info">
            <h3>${title}</h3>
            <p class="release-date"><strong>Release Date:</strong> ${release_date || "N/A"}</p>
            <span class="${getClassByRate(vote_average)}">${vote_average}</span>
        </div>`;

        content.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if (vote >= 8) return "green";
    if (vote >= 5) return "orange";
    return "red";
}

// Search with pagination
let debounceTimeout;
search.addEventListener("input", () => {
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
        const searchTerm = search.value.trim();
        if (searchTerm) {
            isSearchActive = true;
            currentQuery = SEARCHAPI + encodeURIComponent(searchTerm) + "&page=";
            currentPage = 1;
            getMovies(currentQuery + currentPage);
        } else {
            isSearchActive = false;
            currentQuery = "";
            currentPage = 1;
            getMovies(APIURL + currentPage);
        }
    }, 300);
});

// Sorting functionality
sortSelect.addEventListener("change", () => {
    sortMovies(sortSelect.value);
});

function sortMovies(criteria) {
    let sortedMovies = [...currentMovies];

    switch (criteria) {
        case "release_asc":
            sortedMovies.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
            break;
        case "release_desc":
            sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
            break;
        case "rating_asc":
            sortedMovies.sort((a, b) => a.vote_average - b.vote_average);
            break;
        case "rating_desc":
            sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
            break;
    }

    showMovies(sortedMovies);
}

// Pagination controls
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchMovies();
    }
});

function fetchMovies() {
    if (isSearchActive) {
        getMovies(currentQuery + currentPage);
    } else {
        getMovies(APIURL + currentPage);
    }
}

function updatePagination() {
    pageNumber.textContent = `Page ${currentPage}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}
