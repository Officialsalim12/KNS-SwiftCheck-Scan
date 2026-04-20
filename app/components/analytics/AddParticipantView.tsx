'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createParticipant, bulkCreateParticipantsFromFile, getNextParticipantId } from '@/app/actions/participants';
import { getEventById } from '@/app/actions/events';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Props {
  eventId: string;
  dashboardPath: string; // e.g. "/admin/events/[eventId]/dashboard" or "/org/dashboard/analytics/[eventId]"
}

export default function AddParticipantView({ eventId, dashboardPath }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(true);
  const [nextId, setNextId] = useState('');
  const [event, setEvent] = useState<{ event_type: string | null } | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResult, setCsvResult] = useState<{
    created: number;
    updated: number;
    failed: number;
    total: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await getEventById(eventId);
        if (error) {
          console.error('Error fetching event:', error);
        } else if (data) {
          setEvent(data);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoadingEvent(false);
      }
    }
    fetchEvent();

    async function fetchNextId() {
      try {
        const result = await getNextParticipantId(eventId);
        if (result?.success && result.nextId) {
          setNextId(result.nextId);
        }
      } catch (err) {
        console.error('Error fetching next ID:', err);
      } finally {
        setIsGeneratingId(false);
      }
    }
    fetchNextId();
  }, [eventId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('event_id', eventId);
    const result = await createParticipant(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`${dashboardPath}/participants`);
      }, 2000);
    }
  }

  async function handleCSVUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCsvResult(null);
    setIsLoading(true);

    if (!csvFile) {
      setError('Please select a file');
      setIsLoading(false);
      return;
    }

    const fileExtension = csvFile.name.toLowerCase().split('.').pop();
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setError('Please select a CSV or XLSX file');
      setIsLoading(false);
      return;
    }

    try {
      const eventType = event?.event_type?.toLowerCase();
      const showTableNumber = eventType === 'party' || eventType === 'marriage';

      let fileContent: string;
      if (fileExtension === 'csv') {
        fileContent = await csvFile.text();
      } else {
        const arrayBuffer = await csvFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fileContent = btoa(binary);
      }

      const result = await bulkCreateParticipantsFromFile(
        fileContent,
        csvFile.name,
        eventId,
        showTableNumber
      );

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result) {
        setCsvResult({
          created: result.created || 0,
          updated: result.updated || 0,
          failed: result.failed || 0,
          total: result.total || 0,
          errors: result.errors || [],
        });
        setIsLoading(false);

        if ((result.created || 0) > 0 || (result.updated || 0) > 0) {
          setTimeout(() => {
            router.push(`${dashboardPath}/participants`);
          }, 3000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      setIsLoading(false);
    }
  }

  const eventType = event?.event_type?.toLowerCase();
  const showTableNumber = eventType === 'party' || eventType === 'marriage';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 md:px-8 md:py-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Add Participants</h1>
          <p className="text-blue-100 text-sm md:text-base">Add a single participant or upload multiple via CSV/XLSX</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setActiveTab('single');
                setError(null);
                setCsvResult(null);
              }}
              className={`flex-1 px-4 py-3 md:px-6 md:py-4 text-sm font-medium transition-all ${activeTab === 'single'
                  ? 'text-blue-600 border-b-2 sm:border-b-2 border-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
            >
              Single Participant
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('csv');
                setError(null);
                setSuccess(false);
              }}
              className={`flex-1 px-4 py-3 md:px-6 md:py-4 text-sm font-medium transition-all ${activeTab === 'csv'
                  ? 'text-blue-600 border-b-2 sm:border-b-2 border-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
            >
              File Upload (CSV/XLSX)
            </button>
          </div>
        </div>

        <div className="p-5 md:p-8">
          {activeTab === 'single' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter participant name"
                />
              </div>

              <div>
                <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Participant ID Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="hidden"
                    name="id_number"
                    value={nextId}
                  />
                  <div className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-bold text-blue-700 shadow-inner flex items-center justify-between ${isGeneratingId ? 'animate-pulse' : ''}`}>
                    <span>{isGeneratingId ? 'Generating...' : nextId}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isGeneratingId ? 'Calculating next available ID...' : 'This unique ID is automatically managed by the system.'}
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter organization name"
                />
              </div>

              {showTableNumber && (
                <div>
                  <label htmlFor="table_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number
                  </label>
                  <input
                    type="number"
                    id="table_number"
                    name="table_number"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter table number (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Optionally specify which table this participant will be seated at.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Success!</p>
                  <p className="text-sm">Participant created successfully! Redirecting...</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create Participant'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(dashboardPath)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeTab === 'csv' && (
            <form onSubmit={handleCSVUpload} className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">File Format (CSV or XLSX)</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Your file should have the following columns (first row should be headers):
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li><strong>name</strong> (required) - Participant&apos;s full name</li>
                  <li><strong>email</strong> (required) - Email address</li>
                  <li><strong>id_number</strong> (required) - Unique ID number</li>
                  <li><strong>phone</strong> (optional) - Phone number</li>
                  <li><strong>organization</strong> (optional) - Organization name</li>
                  {showTableNumber && (
                    <li><strong>table_number</strong> (optional) - Table number</li>
                  )}
                </ul>
              </div>

              <div>
                <label htmlFor="csv_file" className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (CSV or XLSX) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="csv_file"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="csv_file"
                          name="csv_file"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="sr-only"
                          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV or XLSX files</p>
                    {csvFile && (
                      <p className="text-sm text-gray-700 mt-2">
                        Selected: <span className="font-medium">{csvFile.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {csvResult && (
                <div className="space-y-3">
                  <div className={`border-l-4 px-4 py-3 rounded-lg ${csvResult.created > 0
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-yellow-50 border-yellow-400 text-yellow-700'
                    }`}>
                    <p className="font-medium">
                      Processed {csvResult.total} participants
                    </p>
                    <p className="text-sm">
                      ✓ Created: {csvResult.created} {csvResult.updated > 0 && `| ↻ Updated: ${csvResult.updated}`} | ✗ Failed: {csvResult.failed}
                    </p>
                  </div>

                  {csvResult.errors.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 px-4 py-3 rounded-lg max-h-60 overflow-y-auto">
                      <p className="font-medium text-red-700 mb-2">Errors:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {csvResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {csvResult.created > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
                      <p className="text-sm">Redirecting to participants list...</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !csvFile}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Processing...' : 'Upload & Create Participants'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(dashboardPath)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
