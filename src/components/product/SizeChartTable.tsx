import logoAvance from "@/assets/logo-avance.png";

const SizeChartTable = () => {
  return (
    <div className="bg-gradient-to-br from-rose-50 via-purple-50/30 to-rose-100/50 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block bg-stone-100 rounded-full px-6 py-2 mb-4">
          <h3 className="text-lg font-bold text-stone-600 tracking-wide">TABELA DE MEDIDAS</h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr>
              <th className="py-3 px-2 md:px-4 text-left font-semibold text-stone-600 bg-stone-100/50 rounded-tl-lg">TAMANHOS</th>
              <th className="py-3 px-2 md:px-4 text-center font-bold text-stone-700 bg-rose-100/70">P</th>
              <th className="py-3 px-2 md:px-4 text-center font-bold text-stone-700 bg-green-100/70">M</th>
              <th className="py-3 px-2 md:px-4 text-center font-bold text-stone-700 bg-stone-200/70">G</th>
              <th className="py-3 px-2 md:px-4 text-center font-bold text-stone-700 bg-stone-300/70 rounded-tr-lg">GG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/50">
            <tr className="hover:bg-white/40 transition-colors">
              <td className="py-3 px-2 md:px-4 font-medium text-stone-600">ABDÔMEN</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">65 à 75</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">76 à 86</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">87 à 97</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">98 à 108</td>
            </tr>
            <tr className="hover:bg-white/40 transition-colors">
              <td className="py-3 px-2 md:px-4 font-medium text-stone-600">QUADRIL</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">89 à 98</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">99 à 108</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">109 à 117</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">118 à 126</td>
            </tr>
            <tr className="hover:bg-white/40 transition-colors">
              <td className="py-3 px-2 md:px-4 font-medium text-stone-600">COXA</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">55 à 58</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">59 à 63</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">64 à 67</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">68 à 71</td>
            </tr>
            <tr className="hover:bg-white/40 transition-colors">
              <td className="py-3 px-2 md:px-4 font-medium text-stone-600 rounded-bl-lg">JOELHO</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">35 à 38</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">39 à 42</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700">43 à 45</td>
              <td className="py-3 px-2 md:px-4 text-center text-stone-700 rounded-br-lg">46 à 48</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p className="text-sm text-stone-500 text-center">
        Para medir o seu corpo é necessário ter uma fita métrica.
      </p>

      {/* Logo */}
      <div className="flex flex-col items-center gap-1 pt-2">
        <img src={logoAvance} alt="Avance" className="w-10 h-10 object-contain" />
        <span className="text-xs font-semibold text-stone-600 tracking-widest">AVANCE</span>
      </div>
    </div>
  );
};

export default SizeChartTable;
