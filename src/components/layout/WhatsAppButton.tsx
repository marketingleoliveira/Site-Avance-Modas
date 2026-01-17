import { MessageCircle } from 'lucide-react';
import { useContactSettings } from '@/hooks/useSiteSettings';

const WhatsAppButton = () => {
  const { settings } = useContactSettings();

  const handleClick = () => {
    const phoneNumber = settings?.whatsapp_number?.replace(/\D/g, '') || '';
    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Don't show if no number configured
  if (!settings?.whatsapp_number) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-current" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Fale conosco
      </span>
    </button>
  );
};

export default WhatsAppButton;
