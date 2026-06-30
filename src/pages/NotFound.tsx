import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import RouteSEO from "@/components/seo/RouteSEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <RouteSEO
        title="Página não encontrada (404) | Avance Modas"
        description="A página que você procura não existe ou foi movida. Volte ao início e explore nossas leggings, tops, shorts e conjuntos fitness."
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <a href="/" className="text-primary underline hover:text-primary/90">Início</a>
          <a href="/varejo" className="text-primary underline hover:text-primary/90">Loja Varejo</a>
          <a href="/atacado" className="text-primary underline hover:text-primary/90">Loja Atacado</a>
          <a href="/categoria/leggings" className="text-primary underline hover:text-primary/90">Leggings</a>
          <a href="/categoria/tops" className="text-primary underline hover:text-primary/90">Tops</a>
          <a href="/categoria/shorts" className="text-primary underline hover:text-primary/90">Shorts</a>
        </nav>
      </div>
    </div>
  );
};

export default NotFound;
