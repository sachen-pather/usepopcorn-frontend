export function WatchedMovie({ movie, onDeleteWatched, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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
          <span>
            {movie.isEpisodeRuntime ? movie.Runtime : `${movie.Runtime} min`}
          </span>
        </p>
      </div>
      <button
        className="btn-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteWatched(movie.imdbID);
        }}
      >
        X
      </button>
    </li>
  );
}
