import { useEffect, useState } from "react";

export function useRouter() {
  const [path, setPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("locationchange", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("locationchange", handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", to);
      setPath(to);
      window.dispatchEvent(new Event("locationchange"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return { path, navigate };
}
