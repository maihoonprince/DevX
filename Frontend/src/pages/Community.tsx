
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/community/feed");
  }, [navigate]);

  // We add a loading state in case the redirect takes a moment
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-100">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-gray-800">Redirecting to Feed...</h2>
        <p className="text-gray-600">Taking you to the community space</p>
      </div>
    </div>
  );
};

export default Community;
