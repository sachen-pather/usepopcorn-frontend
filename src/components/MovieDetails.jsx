import { useState, useEffect } from "react";
import { KEY } from "../App";
import { Loader } from "./Loader";
import StarRating from "./StarRating";
import Movie from "./Movie";

export function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
  onPosterSelect,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // Check if movie is already in watched list
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  // Destructure movie details
  const {
    Title,
    Year,
    Poster,
    Runtime,
    imdbRating,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
  } = movie;

  // Fetch movie details when selectedId changes
  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      onPosterSelect(data.Poster); // Update the poster when movie details are loaded
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId, onPosterSelect]);

  // Handle adding movie to watched list
  function handleAdd() {
    // Check if runtime contains 'S' or other letters (excluding 'min')
    const isEpisodeRuntime =
      Runtime?.match(/[a-zA-Z]/g)?.filter(
        (char) => char !== "n" && char !== "i" && char !== "m"
      )?.length > 0;

    const newWatchedMovie = {
      imdbID: selectedId,
      Title: Title,
      Year: Year,
      Poster: Poster,
      Runtime: isEpisodeRuntime
        ? `${Runtime}` // Keep original format for episode runtime
        : Number(Runtime?.split(" ")[0]) || 0, // Convert to number only for movies
      isEpisodeRuntime: isEpisodeRuntime, // Add flag to identify episode runtimes
      imdbRating: Number(imdbRating),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      if (!Title) return;
      document.title = `movie | ${Title}`;

      return function () {
        document.title = "PopcornFlix";
      };
    },
    [Title]
  );

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={Poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{Plot}</em>
            </p>
            <p>Starring {Actors}</p>
            <p>Directed by {Director}</p>
          </section>
        </>
      )}
    </div>
  );
}
