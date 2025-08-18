import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          LAMUMU COLLECTION
        </Link>

        <div className="nav-links">
          {user ? (
            <div className="nav-user">
              <span className="nav-email">Welcome, {user.email}</span>
              <button onClick={handleSignOut} className="nav-btn">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-btn">
                Login
              </Link>
              <Link to="/register" className="nav-btn nav-btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="support">
        <h3>Support Community</h3>
        LAMUMU :
        <a
          href="https://x.com/lamumudotxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <a
          href="https://discord.gg/lamumudotxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord
        </a>
        <br />
        <br />
        COMMON :
        <a
          href="https://x.com/commondotxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <a
          href="https://landing.common.xyz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Website
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
