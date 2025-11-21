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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        {participant.qr_code_url && (
          <div className="flex flex-col items-center mb-4">
            <img
              src={participant.qr_code_url}
              alt={`QR Code for ${participant.name}`}
              width={150}
              height={150}
              className="border border-gray-200 rounded mb-3"
            />
            <button
              onClick={handleDownloadQR}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
        {participant.photo_url && (
          <div className="mb-4 flex justify-center">
            <img
              src={participant.photo_url}
              alt={participant.name}
              className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 shadow-lg"
            />
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
          {participant.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Email:</span> {participant.email}
        </p>
        {participant.id_number && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">ID Number:</span> {participant.id_number}
          </p>
        )}
        {participant.phone && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Phone:</span> {participant.phone}
          </p>
        )}
        {participant.organization && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Organization:</span> {participant.organization}
          </p>
        )}
        {participant.table_number && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Table Number:</span> {participant.table_number}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Created: {formatDate(participant.created_at)}
        </p>
      </div>
    </div>
  );
}

