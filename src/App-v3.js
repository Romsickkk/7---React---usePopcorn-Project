import { useEffect, useRef, useState } from "react";
import StarRaiting from "./StarRaiting";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "dc240808";

export default function App() {
  const [query, setQuery] = useState("Underworld");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <Numresaults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList onSelectMovie={handleSelectMovie} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {!selectedId ? (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          ) : (
            <MovieDetail
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatch}
              watched={watched}
            />
          )}
        </Box>
      </Main>
    </>
  );
}

//====================================================================================

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return;
      if (e.key === "Enter") {
        inputEl.current.focus();
        console.log(e.key);
        setQuery("");
      }
    }

    document.addEventListener("keydown", callback);

    return () => document.addEventListener("keydown", callback);
  }, []);

  // useEffect(function () {
  //   const el = document.querySelector(".search");
  //   el.focus();
  // }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Numresaults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

//=====================================================================================

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box scrollable-element">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  const noPosterSRC =
    "https://m.media-amazon.com/images/M/MV5BMzU3YWYwNTQtZTdiMC00NjY5LTlmMTMtZDFlYTEyODBjMTk5XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg";

  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      {movie.Poster === "N/A" ? (
        <img src={noPosterSRC} alt={`${movie.Title} poster`} />
      ) : (
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
      )}
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetail({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("num");
  const isAlreadyWatched = watched.find((movie) => movie.imdbID === selectedId);

  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  /* eslint-disable */
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true);
  // if (imdbRating > 8) return <p>Greatest Ever</p>;

  // const [isTop, setIstop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIstop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );

  const isTop = imdbRating > 8;

  const [avaragRating, setAvarageReating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    // onCloseMovie();
    // setAvarageReating(Number(imdbRating));
    // setAvarageReating((avaragRating) => (avaragRating + userRating) / 2);
  }

  useEffect(
    function () {
      function handleKeyDown(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", handleKeyDown);
      return function () {
        document.removeEventListener("keydown", handleKeyDown);
      };
    },
    [onCloseMovie]
  );

  // const selectedMovie = movies.find((movie) => movie.imdbID === selectedId);
  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();

      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              ⬅
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          {/* <p>{avaragRating}</p> */}

          <section>
            <div className="rating">
              {isAlreadyWatched ? (
                <p>You rated with movie</p>
              ) : (
                <>
                  <StarRaiting
                    size="28"
                    maxRating="10"
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteWatched={onDeleteWatched}
          />
        ))}
      </ul>
    </>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
