'use client';

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

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  const handleDownloadQR = async () => {
    if (!participant.qr_code_url) {
      alert('QR code not available');
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
      alert('Failed to download QR code');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group h-full flex flex-col">
      {/* Card Header with Gradient - Fixed Height */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 min-h-[80px] flex flex-col justify-center">
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
              Download QR Code
            </button>
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
    </div>
  );
}

