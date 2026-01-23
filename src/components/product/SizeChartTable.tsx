import tabelaMedidas from "@/assets/tabela-medidas.jpg";

const SizeChartTable = () => {
  return (
    <div className="w-full">
      <img 
        src={tabelaMedidas} 
        alt="Tabela de Medidas - Avance Modas" 
        className="w-full h-auto rounded-lg shadow-sm"
      />
    </div>
  );
};

export default SizeChartTable;
