import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

const VirtualFittingRoom = () => {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-3xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-foreground">
          Provador virtual temporariamente indisponível
        </h1>

        <p className="mb-8 text-muted-foreground">
          Estamos preparando uma nova versão do provador virtual.
          Enquanto isso, você pode continuar consultando normalmente
          os produtos e tamanhos disponíveis na loja.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a loja
        </Link>
      </section>
    </main>
  );
};

export default VirtualFittingRoom;
