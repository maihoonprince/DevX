
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/community/feed");
  }, [navigate]);

  return null;
};

export default Community;
