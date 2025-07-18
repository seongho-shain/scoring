import { useEffect, useState } from "react";

export default function useTeams() {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    fetch("/teams/")
      .then((res) => res.json())
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);
  return teams;
}
