import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";

const StoreSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo Central */}
        <div className="text-center mb-12">
          <img 
            src={logoAvance} 
            alt="Avance Modas" 
            className="h-24 mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Bem-vindo à Avance Modas
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha como deseja comprar
          </p>
        </div>

        {/* Store Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Atacado Card */}
          <Link 
            to="/atacado" 
            className="group relative bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={logoAvance} 
                  alt="Atacado" 
                  className="h-20 w-20 object-contain"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-3">
                ATACADO
              </h2>
              <p className="text-muted-foreground mb-4">
                Compras em quantidade com preços especiais para revendedores
              </p>
              
              <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                Acessar Atacado
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Varejo Card */}
          <Link 
            to="/varejo" 
            className="group relative bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={logoAvance} 
                  alt="Varejo" 
                  className="h-20 w-20 object-contain"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-3">
                VAREJO
              </h2>
              <p className="text-muted-foreground mb-4">
                Compras unitárias com toda a qualidade Avance Modas
              </p>
              
              <div className="inline-flex items-center gap-2 text-accent font-semibold group-hover:gap-4 transition-all">
                Acessar Varejo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-muted-foreground text-sm">
          <p>© 2024 Avance Modas - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
