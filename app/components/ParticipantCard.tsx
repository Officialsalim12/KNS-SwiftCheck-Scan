import { useState } from 'react';
import EditParticipantModal from './EditParticipantModal';
import { useToast } from '@/lib/ToastContext';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  qr_code_url?: string;
  photo_url?: string;
  created_at: string;
  id_number?: string;
  table_number?: number | null;
  event_id: string;
}

interface ParticipantCardProps {
  participant: Participant;
}

/**
 * Format date consistently for server and client
 * Returns date in DD/MM/YYYY format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ParticipantCard({ participant: initialParticipant }: ParticipantCardProps) {
  const [participant, setParticipant] = useState(initialParticipant);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const handleDownloadQR = async () => {
    if (!participant.qr_code_url) {
      toastError('QR code not available');
      return;
    }

    try {
      // Fetch the image
      const response = await fetch(participant.qr_code_url);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${participant.name.replace(/\s+/g, '_')}_QR_Code.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toastError('Failed to download QR code');
    }
  };

  const handleShareQR = async () => {
    if (!participant.qr_code_url) {
      toastError('QR code not available');
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch(participant.qr_code_url);
      const blob = await response.blob();
      const file = new File([blob], `${participant.name.replace(/\s+/g, '_')}_QR.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${participant.name}'s QR Code`,
          text: `Check-in QR code for ${participant.name}`,
        });
      } else {
        // Fallback for desktop or non-supporting browsers
        const shareUrl = `mailto:?subject=QR Code for ${encodeURIComponent(participant.name)}&body=You can download the QR code here: ${encodeURIComponent(participant.qr_code_url)}`;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Basic fallback
      toastError('Sharing not supported on this browser. You can download the image instead.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!participant.phone) {
      toastError('No phone number available for this participant');
      return;
    }

    if (!participant.qr_code_url) {
      toastError('QR code not available');
      return;
    }

    // Clean phone number: keep only digits
    const cleanedPhone = participant.phone.replace(/\D/g, '');
    
    // Construct message
    const message = `🎉 Congratulations!

You have been selected for the KNS Digital Literacy Training Program. We are excited to have you join us!

📋 Your Training Details:
Participant ID: ${participant.id_number || 'N/A'}
Cohort: 3
Training Dates: Wednesday 22th - Tuesday 28th April 2026
Location: 18 Dundas Street, Freetown
Session Time: 10:00am

🌐 Access the Learning Platform:
https://elearning.kns.sl

📱 Your QR Code for Attendance:
${participant.qr_code_url}

⚠️ Important: Please bring your QR code (printed or on your phone) on the day of training for attendance.

If you have any questions, feel free to contact us on +23279422422

We look forward to seeing you!

Best regards,  
KNS Training Team`;
    
    // WhatsApp URL
    const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group h-full flex flex-col">
      {/* Card Header with Gradient - Fixed Height */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 min-h-[80px] flex flex-col justify-center relative">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all border border-white/10"
          title="Edit Participant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        {participant.photo_url ? (
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-3">
              <img
                src={participant.photo_url}
                alt={participant.name}
                className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-xl"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white text-center tracking-wider uppercase">
              {participant.name}
            </h3>
          </div>
        ) : (
          <h3 className="text-lg md:text-xl font-bold text-white text-center tracking-wider uppercase">
            {participant.name}
          </h3>
        )}
      </div>

      {/* Card Body - Flexible to fill remaining space */}
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        {participant.qr_code_url && (
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
            <div className="bg-white p-3 rounded-lg shadow-md mb-4">
              <img
                src={participant.qr_code_url}
                alt={`QR Code for ${participant.name}`}
                width={180}
                height={180}
                className="rounded"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleDownloadQR}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download QR
              </button>

              <button
                onClick={handleShareQR}
                disabled={isSharing}
                className="w-full px-4 py-2.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSharing ? (
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                )}
                Share QR
              </button>

              {participant.phone && (
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-all border border-emerald-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Direct WhatsApp
                </button>
              )}
            </div>
          </div>
        )}

        {/* Participant Details - Consistent spacing */}
        <div className="space-y-3 flex-grow">
          <div className="flex items-start min-h-[20px] md:min-h-[24px] gap-1">
            <span className="font-bold text-gray-700 flex-shrink-0 text-xs md:text-sm">Email:</span>
            <span className="text-gray-600 text-xs md:text-sm flex-1 break-words min-w-0">{participant.email}</span>
          </div>

          <div className="flex items-start min-h-[20px] md:min-h-[24px] gap-1">
            <span className="font-bold text-gray-700 flex-shrink-0 text-xs md:text-sm">ID Number:</span>
            <span className="text-gray-600 text-xs md:text-sm flex-1 break-words min-w-0">
              {participant.id_number || <span className="text-gray-400 italic">N/A</span>}
            </span>
          </div>

          <div className="flex items-start min-h-[20px] md:min-h-[24px] gap-1">
            <span className="font-bold text-gray-700 flex-shrink-0 text-xs md:text-sm">Phone:</span>
            <span className="text-gray-600 text-xs md:text-sm flex-1 break-words min-w-0">
              {participant.phone || <span className="text-gray-400 italic">N/A</span>}
            </span>
          </div>

          <div className="flex items-start min-h-[20px] md:min-h-[24px] gap-1">
            <span className="font-bold text-gray-700 flex-shrink-0 text-xs md:text-sm">Organization:</span>
            <span className="text-gray-600 text-xs md:text-sm flex-1 break-words min-w-0">
              {participant.organization || <span className="text-gray-400 italic">N/A</span>}
            </span>
          </div>

          {participant.table_number && (
            <div className="flex items-start min-h-[20px] md:min-h-[24px] gap-1">
              <span className="font-bold text-gray-700 flex-shrink-0 text-xs md:text-sm">Table Number:</span>
              <span className="text-gray-600 text-xs md:text-sm flex-1 break-words min-w-0">{participant.table_number}</span>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Created: {formatDate(participant.created_at)}
          </p>
        </div>
      </div>

      <EditParticipantModal
        participant={participant}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={setParticipant}
      />
    </div>
  );
}

