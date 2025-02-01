import { useEffect, useState, useCallback, memo } from "react";
import { debounce } from "lodash";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { WatchedMovieList } from "./components/WatchedMovieList";
import Search from "./components/Search";
import { Logo } from "./components/Logo";
import { NumResults } from "./components/NumResults";
import { NavBar } from "./components/NavBar";
import { WatchedSummary } from "./components/WatchedSummary";
import { MovieDetails } from "./components/MovieDetails";
import { MovieList } from "./components/MovieList";
import { Loader } from "./components/Loader";
import { BoxImage, Box } from "./components/BoxImage";
import { Main } from "./components/Main";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoginPage } from "./components/Login/LoginPage";
import { RegisterPage } from "./components/Login/RegisterPage";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export const KEY = "5d3cfe2";

const MemoizedMovieList = memo(MovieList);
const MemoizedWatchedMovieList = memo(WatchedMovieList);

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!!token !== isAuthenticated) {
        setIsAuthenticated(!!token);
      }
    };

    checkAuth();
    const handleStorage = (e) => {
      if (e.key === "token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isAuthenticated]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  }, [navigate]);

  const handleSelectMovie = useCallback(
    (id) => {
      setSelectedId((selectedId) => {
        if (id === selectedId) {
          setSelectedPoster(null);
          return null;
        }
        const selectedMovie = movies.find((movie) => movie.imdbID === id);
        if (selectedMovie) {
          setSelectedPoster(selectedMovie.Poster);
        }
        return id;
      });
    },
    [movies]
  );

  const handleCloseMovie = useCallback(() => {
    setSelectedId(null);
    setSelectedPoster(null);
  }, []);

  const handleAddWatched = useCallback((movie) => {
    setWatched((watched) => [...watched, movie]);
  }, []);

  const handleDeleteWatched = useCallback((id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery, controller) => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${searchQuery.trim()}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Something went wrong with fetching");

        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found");

        setMovies(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setMovies([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    if (query) {
      debouncedSearch(query, controller);
    }

    return () => {
      controller.abort();
    };
  }, [query, debouncedSearch]);

  const MainAppContent = useCallback(() => {
    return (
      <>
        <NavBar>
          <Logo />
          <Search query={query} setQuery={setQuery} />
          <NumResults movies={movies} />
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </NavBar>

        <Main>
          <BoxImage>
            <div
              className="box-with-bg"
              style={{
                backgroundImage: selectedPoster
                  ? `url(${selectedPoster})`
                  : "url('/images/goku.jpg')",
              }}
            />
          </BoxImage>

          <Box>
            {isLoading ? (
              <Loader />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <MemoizedMovieList
                movies={movies}
                onSelectMovie={handleSelectMovie}
              />
            )}
          </Box>

          <Box>
            {selectedId ? (
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched={watched}
                onPosterSelect={setSelectedPoster}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <MemoizedWatchedMovieList
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                  onSelectMovie={handleSelectMovie}
                />
              </>
            )}
          </Box>

          <BoxImage>
            <div
              className="box-with-bg"
              style={{
                backgroundImage: selectedPoster
                  ? `url(${selectedPoster})`
                  : "url('/images/goku.jpg')",
              }}
            />
          </BoxImage>
        </Main>
      </>
    );
  }, [
    movies,
    query,
    isLoading,
    error,
    selectedId,
    selectedPoster,
    watched,
    handleLogout,
    handleSelectMovie,
    handleCloseMovie,
    handleAddWatched,
    handleDeleteWatched,
    setQuery,
  ]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginPage setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <RegisterPage setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <MainAppContent /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
