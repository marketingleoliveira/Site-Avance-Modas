import bannerImg from "@/assets/banner-tecnologia-conforto.png";

const TecnologiaConfortoBanner = () => {
  return (
    <section
      aria-label="Tecnologia e Conforto Avance Modas"
      className="w-full bg-white"
    >
      <img
        src={bannerImg}
        alt="Tecnologia e Conforto - Proteção UV 50+, 4 Way Stretch, Zero Transparência, Aloe Vera Hidratante"
        className="w-full h-auto object-contain"
        loading="lazy"
      />
    </section>
  );
};

export default TecnologiaConfortoBanner;
