import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sparkles, User, Check, ArrowRight, RotateCcw } from "lucide-react";

interface VirtualFittingRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizes: string[];
  onSizeRecommendation: (size: string) => void;
}

type BodyType = "slim" | "regular" | "athletic" | "curvy";
type FitPreference = "tight" | "regular" | "loose";

const VirtualFittingRoom = ({ 
  open, 
  onOpenChange, 
  sizes, 
  onSizeRecommendation 
}: VirtualFittingRoomProps) => {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState([165]);
  const [weight, setWeight] = useState([65]);
  const [bust, setBust] = useState([90]);
  const [waist, setWaist] = useState([70]);
  const [hip, setHip] = useState([100]);
  const [bodyType, setBodyType] = useState<BodyType>("regular");
  const [fitPreference, setFitPreference] = useState<FitPreference>("regular");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const resetForm = () => {
    setStep(1);
    setHeight([165]);
    setWeight([65]);
    setBust([90]);
    setWaist([70]);
    setHip([100]);
    setBodyType("regular");
    setFitPreference("regular");
    setRecommendedSize(null);
  };

  const calculateSize = () => {
    // Algorithm baseado em medidas para recomendar tamanho
    const h = height[0];
    const w = weight[0];
    const b = bust[0];
    const wa = waist[0];
    const hi = hip[0];

    // Calcular IMC aproximado
    const imc = w / ((h / 100) ** 2);
    
    // Média ponderada das medidas
    const avgMeasure = (b * 0.3 + wa * 0.3 + hi * 0.4);
    
    // Ajuste baseado no tipo de corpo
    let adjustment = 0;
    if (bodyType === "slim") adjustment = -2;
    if (bodyType === "athletic") adjustment = 0;
    if (bodyType === "curvy") adjustment = 2;
    
    // Ajuste baseado na preferência de caimento
    let fitAdjustment = 0;
    if (fitPreference === "tight") fitAdjustment = -1;
    if (fitPreference === "loose") fitAdjustment = 1;
    
    const finalScore = avgMeasure + adjustment + fitAdjustment;
    
    // Mapear para tamanhos disponíveis
    let recommended: string;
    if (finalScore < 82) {
      recommended = "PP";
    } else if (finalScore < 90) {
      recommended = "P";
    } else if (finalScore < 98) {
      recommended = "M";
    } else if (finalScore < 106) {
      recommended = "G";
    } else if (finalScore < 114) {
      recommended = "GG";
    } else {
      recommended = "XGG";
    }
    
    // Verificar se o tamanho existe nas opções
    const sizeOrder = ["PP", "P", "M", "G", "GG", "XGG", "XG", "EXG", "EGG"];
    const availableSizes = sizes.map(s => s.toUpperCase());
    
    if (availableSizes.includes(recommended)) {
      setRecommendedSize(recommended);
    } else {
      // Encontrar o tamanho mais próximo disponível
      const recIndex = sizeOrder.indexOf(recommended);
      let closest = sizes[0];
      let minDiff = Infinity;
      
      for (const size of sizes) {
        const sizeIndex = sizeOrder.indexOf(size.toUpperCase());
        if (sizeIndex !== -1) {
          const diff = Math.abs(sizeIndex - recIndex);
          if (diff < minDiff) {
            minDiff = diff;
            closest = size;
          }
        }
      }
      setRecommendedSize(closest);
    }
    
    setStep(4);
  };

  const handleSelectSize = () => {
    if (recommendedSize) {
      onSizeRecommendation(recommendedSize);
      onOpenChange(false);
      resetForm();
    }
  };

  const bodyTypes = [
    { value: "slim", label: "Magro", icon: "○" },
    { value: "regular", label: "Regular", icon: "◎" },
    { value: "athletic", label: "Atlético", icon: "◉" },
    { value: "curvy", label: "Curvilíneo", icon: "●" },
  ];

  const fitTypes = [
    { value: "tight", label: "Justo", desc: "Modelagem mais próxima ao corpo" },
    { value: "regular", label: "Regular", desc: "Caimento padrão confortável" },
    { value: "loose", label: "Folgado", desc: "Mais espaço e liberdade" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold flex items-center justify-center gap-2 text-primary-foreground">
              <Sparkles className="w-5 h-5" />
              Provador Virtual Avance
            </DialogTitle>
            <p className="text-center text-sm text-primary-foreground/80 mt-1">
              Descubra seu tamanho ideal em poucos passos
            </p>
          </DialogHeader>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= s 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 sm:w-16 h-1 mx-1 rounded ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-2">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-12 h-12 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-lg">Suas Medidas Básicas</h3>
                <p className="text-sm text-muted-foreground">Informe sua altura e peso</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="font-medium">Altura</Label>
                    <span className="text-primary font-semibold">{height[0]} cm</span>
                  </div>
                  <Slider
                    value={height}
                    onValueChange={setHeight}
                    min={140}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>140 cm</span>
                    <span>200 cm</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="font-medium">Peso</Label>
                    <span className="text-primary font-semibold">{weight[0]} kg</span>
                  </div>
                  <Slider
                    value={weight}
                    onValueChange={setWeight}
                    min={40}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>40 kg</span>
                    <span>150 kg</span>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full gap-2" size="lg">
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Body Measurements */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Medidas do Corpo</h3>
                <p className="text-sm text-muted-foreground">Use uma fita métrica para maior precisão</p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="font-medium">Busto/Peito</Label>
                    <span className="text-primary font-semibold">{bust[0]} cm</span>
                  </div>
                  <Slider
                    value={bust}
                    onValueChange={setBust}
                    min={70}
                    max={140}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="font-medium">Cintura</Label>
                    <span className="text-primary font-semibold">{waist[0]} cm</span>
                  </div>
                  <Slider
                    value={waist}
                    onValueChange={setWaist}
                    min={55}
                    max={130}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="font-medium">Quadril</Label>
                    <span className="text-primary font-semibold">{hip[0]} cm</span>
                  </div>
                  <Slider
                    value={hip}
                    onValueChange={setHip}
                    min={75}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 gap-2">
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Body Type & Preference */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Preferências</h3>
                <p className="text-sm text-muted-foreground">Selecione seu tipo de corpo e caimento preferido</p>
              </div>

              <div className="space-y-4">
                <Label className="font-medium">Tipo de Corpo</Label>
                <RadioGroup 
                  value={bodyType} 
                  onValueChange={(v) => setBodyType(v as BodyType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {bodyTypes.map((type) => (
                    <Label
                      key={type.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        bodyType === type.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type.value} className="sr-only" />
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="font-medium">Preferência de Caimento</Label>
                <RadioGroup 
                  value={fitPreference} 
                  onValueChange={(v) => setFitPreference(v as FitPreference)}
                  className="space-y-2"
                >
                  {fitTypes.map((fit) => (
                    <Label
                      key={fit.value}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        fitPreference === fit.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <span className="font-medium">{fit.label}</span>
                        <p className="text-xs text-muted-foreground">{fit.desc}</p>
                      </div>
                      <RadioGroupItem value={fit.value} />
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={calculateSize} className="flex-1 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Descobrir Tamanho
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="py-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Check className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2">Seu Tamanho Ideal</h3>
                <p className="text-muted-foreground text-sm">
                  Com base nas suas medidas e preferências
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <span className="text-6xl font-bold text-primary">{recommendedSize}</span>
                <p className="text-sm text-muted-foreground mt-3">
                  Recomendamos este tamanho para o melhor caimento
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-sm mb-2">📏 Suas Medidas:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Altura: {height[0]} cm</span>
                  <span>Peso: {weight[0]} kg</span>
                  <span>Busto: {bust[0]} cm</span>
                  <span>Cintura: {waist[0]} cm</span>
                  <span>Quadril: {hip[0]} cm</span>
                  <span>Caimento: {fitTypes.find(f => f.value === fitPreference)?.label}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleSelectSize} className="w-full gap-2" size="lg">
                  <Check className="w-4 h-4" />
                  Selecionar Tamanho {recommendedSize}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={resetForm}
                  className="w-full gap-2 text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refazer Medição
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualFittingRoom;
